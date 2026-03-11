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
    const senderPhone = msg.key.remoteJid?.split('@')[0] || '';
    if (!senderPhone) return;

    // Format message to match Cloud API structure for handleIncomingMessage
    let formattedMessage: any = {
      id: msg.key.id,
      from: senderPhone,
      type: 'text'
    };

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonReply = msg.message?.buttonsResponseMessage;
    const listReply = msg.message?.listResponseMessage;

    if (text) {
      formattedMessage.type = 'text';
      formattedMessage.text = { body: text };
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
      const { data: organization } = await supabase.from('organizations').select('*').limit(1).single();
      
      if (organization) {
        // Upsert Contact
        const { data: contact } = await supabase
          .from('contacts')
          .upsert({
            organization_id: organization.id,
            phone_number: senderPhone,
            profile_name: msg.pushName || '',
            last_active_at: new Date().toISOString()
          }, { onConflict: 'organization_id,phone_number' })
          .select().single();

        if (contact) {
          // Upsert Conversation
          let { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('organization_id', organization.id)
            .eq('contact_id', contact.id)
            .single();

          if (!conversation) {
            const { data: newConv } = await supabase
              .from('conversations')
              .insert({ organization_id: organization.id, contact_id: contact.id })
              .select().single();
            conversation = newConv;
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
  async sendTextMessage(to: string, body: string) {
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    return await this.socket.sendMessage(jid, { text: body });
  }

  async sendButtonMessage(to: string, bodyText: string, buttons: any[]) {
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    // Baileys button format
    const formattedButtons = buttons.map(btn => ({
      buttonId: btn.id,
      buttonText: { displayText: btn.title },
      type: 1
    }));

    return await this.socket.sendMessage(jid, {
      text: bodyText,
      buttons: formattedButtons,
      headerType: 1
    });
  }

  async sendMediaMessage(to: string, url: string) {
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    const ext = url.split('.').pop()?.toLowerCase() || '';
    
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return await this.socket.sendMessage(jid, { image: { url } });
    } else if (['mp4'].includes(ext)) {
      return await this.socket.sendMessage(jid, { video: { url } });
    } else {
      return await this.socket.sendMessage(jid, { document: { url }, fileName: `file.${ext}` });
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
