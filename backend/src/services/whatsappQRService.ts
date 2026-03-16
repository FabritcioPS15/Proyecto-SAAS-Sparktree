import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { supabase } from '../config/supabase';
import { handleIncomingMessage } from '../flows';

class WhatsAppQRService {
  private socket: any = null;
  private qr: string | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private logger = pino({ level: 'silent' });
  private connectedPhoneNumber: string | null = null;

  async initialize() {
    // Si ya estamos conectando o conectados, no reiniciamos a menos que se fuerce
    if (this.connectionStatus === 'connecting' || this.connectionStatus === 'connected') {
      console.log(`Aborting initialization: already ${this.connectionStatus}`);
      return;
    }

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
      logger: this.logger,
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qr = qr;
        this.connectionStatus = 'connecting';
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
        this.connectionStatus = 'error';
        this.qr = null;
        if (shouldReconnect) {
          this.initialize();
        }
      } else if (connection === 'open') {
        console.log('opened connection');
        this.connectionStatus = 'connected';
        this.qr = null;
        
        // Capturar el número de teléfono del dispositivo conectado
        if (this.socket.user?.id) {
          this.connectedPhoneNumber = this.socket.user.id.split(':')[0] + '@s.whatsapp.net';
          console.log(`[QR Service] Connected phone number: ${this.connectedPhoneNumber}`);
        }
      }
    });

    this.socket.ev.on('messages.upsert', async (m: { messages: proto.IWebMessageInfo[], type: string }) => {
      console.log(`[QR Service] Received messages.upsert of type: ${m.type}`);
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          console.log(`[QR Service] Raw message: fromMe=${msg.key?.fromMe}, type=${Object.keys(msg.message || {})[0]}`);
          if (msg.key && !msg.key.fromMe && msg.message) {
            await this.processIncomingMessage(msg);
          }
        }
      }
    });
  }

  private async processIncomingMessage(msg: proto.IWebMessageInfo) {
    if (!msg.key || !msg.key.id) return;
    const remoteJid = msg.key.remoteJid || '';
    
    // ATTEMPT TO RESOLVE REAL PHONE NUMBER (JID) FROM LID
    // Priority: remoteJidAlt > senderPn > remoteJid (if not LID)
    let senderPhone = '';
    const remoteJidAlt = (msg.key as any).remoteJidAlt;
    const messageContent = msg.message;
    const senderPn = (messageContent as any)?.senderPn || (messageContent as any)?.protocolMessage?.senderPn;

    if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
      senderPhone = remoteJidAlt.split('@')[0];
      console.log(`[QR Service] Resolved real phone from remoteJidAlt: ${senderPhone}`);
    } else if (senderPn) {
      senderPhone = senderPn.split('@')[0];
      console.log(`[QR Service] Resolved real phone from senderPn: ${senderPhone}`);
    } else if (!remoteJid.endsWith('@lid')) {
      senderPhone = remoteJid.split('@')[0].split(':')[0];
    } else {
      // If we ONLY have a LID, we have to use it as the "phone number" for now,
      // but we mark it clearly.
      senderPhone = remoteJid.split('@')[0];
      console.log(`[QR Service] WARNING: Only LID found for sender: ${senderPhone}`);
    }

    if (!senderPhone) return;

    // Format message to match Cloud API structure
    let formattedMessage: any = {
      id: msg.key.id,
      from: senderPhone,
      type: 'text'
    };

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonReply = msg.message?.buttonsResponseMessage;
    const listReply = msg.message?.listResponseMessage;

    if (text) {
      // Check if this is a numeric response to button options
      const cleanText = text.trim();
      const numberMatch = cleanText.match(/^(\d+)$/);
      
      if (numberMatch) {
        const buttonNumber = numberMatch[1];
        console.log(`[QR Service] Received numeric response: ${buttonNumber}`);
        
        // Try to find a recent button mapping for this conversation
        // This would require storing button mappings somewhere - for now, treat as regular text
        formattedMessage.type = 'text';
        formattedMessage.text = { body: text };
        formattedMessage.isNumericButtonResponse = true;
        formattedMessage.buttonNumber = buttonNumber;
      } else {
        formattedMessage.type = 'text';
        formattedMessage.text = { body: text };
      }
    } else if (buttonReply) {
      formattedMessage.type = 'interactive';
      formattedMessage.interactive = {
        type: 'button_reply',
        button_reply: { id: buttonReply.selectedButtonId, title: buttonReply.selectedDisplayText }
      };
    } else {
      // Handle other types if needed
      return;
    }

    try {
      // Basic organizational lookup (same logic as webhookController)
      console.log(`[QR Service] Looking up organization...`);
      const { data: organization, error: orgError } = await supabase.from('organizations').select('*').limit(1).single();
      
      if (orgError) {
        console.error(`[QR Service] Error finding organization:`, orgError);
        return;
      }
      
      if (organization) {
        console.log(`[QR Service] Organization found: ${organization.id}`);
        console.log(`[QR Service] Saving contact with REAL WhatsApp number: ${senderPhone}`);
        console.log(`[QR Service] Contact name: ${msg.pushName || 'No name'}`);

        // Guardar contacto con el NÚMERO REAL (o LID resuelto)
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .upsert({
            organization_id: organization.id,
            phone_number: senderPhone,
            profile_name: msg.pushName || '',
            last_active_at: new Date().toISOString(),
            custom_attributes: {
              whatsapp_jid: remoteJid, // Store original JID for precise replies
              is_lid: remoteJid.endsWith('@lid')
            }
          }, { onConflict: 'organization_id,phone_number' })
          .select().single();

        if (contactError) {
          console.error(`[QR Service] Error saving contact:`, contactError);
          return;
        }

        console.log(`[QR Service] Contact saved:`, contact);

        if (contact) {
          console.log(`[QR Service] Creating conversation...`);
          // Upsert Conversation
          let { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('organization_id', organization.id)
            .eq('contact_id', contact.id)
            .single();

          if (!conversation) {
            console.log(`[QR Service] Creating new conversation...`);
            const { data: newConversation } = await supabase
              .from('conversations')
              .insert({
                organization_id: organization.id,
                contact_id: contact.id,
                status: 'open',
                last_message_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              })
              .select()
              .single();
            conversation = newConversation;
            console.log(`[QR Service] New conversation created:`, conversation);
          } else {
            console.log(`[QR Service] Existing conversation found:`, conversation);
          }

          // Save Message
          await supabase.from('messages').insert({
            organization_id: organization.id,
            conversation_id: conversation?.id,
            contact_id: contact.id,
            direction: 'inbound',
            type: formattedMessage.type,
            content: text || JSON.stringify(formattedMessage),
            whatsapp_message_id: msg.key.id
          });

          const organizationConfig = {
            organizationId: organization.id,
            conversationId: conversation?.id,
            contactId: contact.id
          };

          await handleIncomingMessage(formattedMessage, senderPhone, organizationConfig, this);
        }
      }
    } catch (error) {
      console.error('Error processing Baileys message:', error);
    }
  }

  // Messaging methods to satisfy handleIncomingMessage's waService parameter
  async sendTextMessage(to: string, body: string, options?: { jid?: string }) {
    // Priority: Explicit JID > Provided 'to' as JID > 'to' as phone
    const jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
    console.log(`[QR Service] Sending text to JID: ${jid}`);
    return await this.socket.sendMessage(jid, { text: body });
  }

  async sendButtonMessage(to: string, bodyText: string, buttons: any[], options?: { jid?: string }) {
    const jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
    
    console.log(`[QR Service] Creating interactive message for ${buttons.length} options`);
    console.log(`[QR Service] To JID: ${jid}`);
    console.log(`[QR Service] Body text: ${bodyText}`);
    console.log(`[QR Service] Buttons:`, buttons);
    
    // Formato numerado claro y fácil de usar
    const numberedOptions = buttons.map((btn, index) => {
      const number = index + 1;
      return `${number}. ${btn.title}`;
    }).join('\n');
    
    const fullMessage = `${bodyText}\n\n${numberedOptions}\n\n💡 *Responde con el número de tu opción*`;
    
    console.log(`[QR Service] Final message:`, fullMessage);
    
    try {
      const result = await this.socket.sendMessage(jid, { text: fullMessage });
      console.log(`[QR Service] Button-style message sent successfully:`, result);
      console.log(`[QR Service] Message ID:`, result?.key?.id);
      console.log(`[QR Service] Message type:`, Object.keys(result?.message || {}));
      
      // Guardar mapeo de números a IDs para procesar respuestas
      const buttonMapping: { [key: string]: string } = {};
      buttons.forEach((btn, index) => {
        buttonMapping[(index + 1).toString()] = btn.id;
      });
      
      console.log(`[QR Service] Button mapping:`, buttonMapping);
      
      // Retornar resultado con información del mapeo
      return {
        ...result,
        buttonMapping: buttonMapping,
        isNumericButtons: true
      };
      
    } catch (error: any) {
      console.error(`[QR Service] Error sending button-style message:`, error);
      console.error(`[QR Service] Error details:`, error?.message);
      throw error;
    }
  }

  async sendMediaMessage(to: string, url: string, options?: { 
    jid?: string, 
    caption?: string, 
    type?: string, 
    fileName?: string, 
    viewOnce?: boolean 
  }) {
    const jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
    const caption = options?.caption;
    const fileName = options?.fileName;
    const viewOnce = options?.viewOnce;
    
    // Determine type by extension if not provided
    const ext = url.split('.').pop()?.toLowerCase() || '';
    const type = options?.type || (['png', 'jpg', 'jpeg'].includes(ext) ? 'image' : ['mp4'].includes(ext) ? 'video' : 'document');
    
    console.log(`[QR Service] Sending media: type=${type}, url=${url}, caption=${caption || 'none'}`);

    if (type === 'image') {
      return await this.socket.sendMessage(jid, { 
        image: { url }, 
        caption, 
        viewOnce 
      });
    } else if (type === 'video') {
      return await this.socket.sendMessage(jid, { 
        video: { url }, 
        caption, 
        viewOnce 
      });
    } else if (type === 'audio') {
      return await this.socket.sendMessage(jid, { 
        audio: { url } 
      });
    } else {
      // Document
      return await this.socket.sendMessage(jid, { 
        document: { url }, 
        caption,
        fileName: fileName || `archivo.${ext}`,
        mimetype: ext === 'pdf' ? 'application/pdf' : undefined
      });
    }
  }

  getQR() {
    return this.qr;
  }

  getStatus() {
    return this.connectionStatus;
  }

  getConnectedPhoneNumber() {
    return this.connectedPhoneNumber;
  }

  async logout() {
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
      this.qr = null;
      this.connectionStatus = 'disconnected';
      this.connectedPhoneNumber = null;
      // Limpiar carpeta de auth
      if (fs.existsSync('auth_info_baileys')) {
        fs.rmSync('auth_info_baileys', { recursive: true, force: true });
      }
    }
  }
}

export const qrService = new WhatsAppQRService();
