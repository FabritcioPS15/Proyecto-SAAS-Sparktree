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
  private organizationId: string | null = null;

  async initialize() {
    // Si ya estamos conectando o conectados, no reiniciamos a menos que se fuerce
    if (this.connectionStatus === 'connecting' || this.connectionStatus === 'connected') {
      console.log(`Aborting initialization: already ${this.connectionStatus}`);
      return;
    }

    // Inicializar el organizationId si no está seteado
    if (!this.organizationId) {
      const { data: org } = await supabase.from('organizations').select('id').order('created_at', { ascending: true }).limit(1).single();
      if (org) {
        this.organizationId = org.id;
        console.log(`[QR Service] Linked to organization: ${this.organizationId}`);
      }
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
      }
    });

    this.socket.ev.on('messages.upsert', async (m: { messages: proto.IWebMessageInfo[], type: string }) => {
      console.log(`[QR Service] 📩 MESSAGES.UPSERT RECIBIDO!`);
      console.log(`[QR Service] Type: ${m.type}`);
      console.log(`[QR Service] Messages count: ${m.messages.length}`);
      
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          console.log(`[QR Service] 🔍 Procesando mensaje...`);
          console.log(`[QR Service] fromMe=${msg.key?.fromMe}, type=${Object.keys(msg.message || {})[0]}`);
          console.log(`[QR Service] Message ID: ${msg.key?.id}`);
          console.log(`[QR Service] Remote JID: ${msg.key?.remoteJid}`);
          
          if (msg.key && !msg.key.fromMe && msg.message) {
            console.log(`[QR Service] ✅ Mensaje entrante detectado!`);
            await this.processIncomingMessage(msg);
          } else {
            console.log(`[QR Service] ❌ Mensaje ignorado (fromMe=${msg.key?.fromMe} o sin mensaje)`);
          }
        }
      } else {
        console.log(`[QR Service] ❌ Tipo de mensaje ignorado: ${m.type}`);
      }
    });
  }

  private async processIncomingMessage(msg: proto.IWebMessageInfo) {
    console.log(`[QR Service] 🚀 INICIANDO PROCESAMIENTO DE MENSAJE`);
    console.log(`[QR Service] Message ID: ${msg.key?.id}`);
    console.log(`[QR Service] From: ${msg.key?.remoteJid}`);
    console.log(`[QR Service] Message content keys:`, Object.keys(msg.message || {}));
    console.log(`[QR Service] Full message object:`, JSON.stringify(msg.message, null, 2));
    
    if (!msg.key || !msg.key.id) {
      console.log(`[QR Service] ❌ Mensaje sin key o ID, ignorando`);
      return;
    }
    
    const remoteJid = msg.key.remoteJid || '';
    console.log(`[QR Service] Remote JID: ${remoteJid}`);
    
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
    const protocolMsg = msg.message?.protocolMessage;

    // Handle protocol messages (edits, deletes, etc.)
    if (protocolMsg) {
      console.log(`[QR Service] Protocol message detected, type: ${protocolMsg.type}`);
      
      // Ignorar mensajes de sincronización de historial
      if (protocolMsg.type === 5 || (protocolMsg.type as any) === 'HISTORY_SYNC_NOTIFICATION') {
        console.log(`[QR Service] ❌ Ignorando HISTORY_SYNC_NOTIFICATION`);
        return;
      }
      
      // Para otros protocol messages, también ignorar por ahora
      console.log(`[QR Service] ❌ Ignorando protocol message type: ${protocolMsg.type}`);
      return;
    }

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
      console.log(`[QR Service] Message type not handled:`, Object.keys(msg.message || {}));
      return;
    }

    try {
      // Buscar contacto existente primero 
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', this.organizationId)
        .eq('phone_number', senderPhone)
        .order('created_at', { ascending: false })
        .limit(1);

      const existingContact = contacts && contacts.length > 0 ? contacts[0] : null;

      let contact;
      if (existingContact) {
        console.log(`[QR Service] Reusando contacto existente: ${existingContact.id}`);
        // Actualizar contacto existente
        const { data: updatedContact } = await supabase
          .from('contacts')
          .update({
            profile_name: msg.pushName || existingContact.profile_name,
            last_active_at: new Date().toISOString(),
            custom_attributes: {
              ...existingContact.custom_attributes,
              whatsapp_jid: msg.key.remoteJid
            }
          })
          .eq('id', existingContact.id)
          .select()
          .single();
        contact = updatedContact;
      } else {
        console.log(`[QR Service] Creando nuevo contacto para: ${senderPhone}`);
        // Crear nuevo contacto
        const { data: newContact } = await supabase
          .from('contacts')
          .insert({
            organization_id: this.organizationId,
            phone_number: senderPhone,
            profile_name: msg.pushName || '',
            last_active_at: new Date().toISOString(),
            custom_attributes: {
              whatsapp_jid: msg.key.remoteJid
            }
          })
          .select()
          .single();
        contact = newContact;
      }

      console.log(`[QR Service] Contact saved:`, contact?.id);

      // Buscar conversación con organización
      let { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('organization_id', this.organizationId)
        .eq('contact_id', contact?.id)
        .order('last_message_at', { ascending: false })
        .limit(1);

      let conversation = conversations && conversations.length > 0 ? conversations[0] : null;

      if (!conversation) {
        console.log(`[QR Service] Creando nueva conversación para contacto ${contact?.id}`);
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            organization_id: this.organizationId,
            contact_id: contact?.id,
            status: 'open',
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();
        conversation = newConversation;
      } else {
        console.log(`[QR Service] Reusando conversación existente: ${conversation.id}`);
      }

      // Guardar mensaje sin organización
      console.log(`[QR Service] 💾 Guardando mensaje...`);
      console.log(`[QR Service] Conversation ID: ${conversation?.id}`);
      console.log(`[QR Service] Contact ID: ${contact?.id}`);
      console.log(`[QR Service] Message type: ${formattedMessage.type}`);
      console.log(`[QR Service] Message content: ${text || JSON.stringify(formattedMessage)}`);
      
      const { error: messageError } = await supabase.from('messages').insert({
        organization_id: this.organizationId,
        conversation_id: conversation?.id,
        contact_id: contact?.id,
        direction: 'inbound',
        type: formattedMessage.type,
        content: text || JSON.stringify(formattedMessage),
        whatsapp_message_id: msg.key.id
      });

      if (messageError) {
        console.error(`[QR Service] ❌ Error guardando mensaje:`, messageError);
        return;
      } else {
        console.log(`[QR Service] ✅ Mensaje guardado exitosamente`);
      }

      const organizationConfig = {
        organizationId: this.organizationId || undefined,
        conversationId: conversation?.id,
        contactId: contact?.id
      };

      console.log(`[QR Service] Processing flow with config:`, organizationConfig);
      
      await handleIncomingMessage(formattedMessage, senderPhone, organizationConfig, this);
      console.log(`[QR Service] ✅ Flow processing completed`);
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

  async logout() {
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
      this.qr = null;
      this.connectionStatus = 'disconnected';
      // Limpiar carpeta de auth
      if (fs.existsSync('auth_info_baileys')) {
        fs.rmSync('auth_info_baileys', { recursive: true, force: true });
      }
    }
  }
}

export const qrService = new WhatsAppQRService();
