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

interface WhatsAppConnection {
  id: string;
  userId: string;
  organizationId: string;
  displayName: string;
  phoneNumber?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  socket?: any;
  qr?: string;
  authStatePath?: string;
  lastConnectedAt?: Date;
}

export class MultiWhatsAppService {
  private connections: Map<string, WhatsAppConnection> = new Map();
  private logger = pino({ level: 'silent' });

  // Initialize all connections in the database (for server startup)
  async initializeAllConnections() {
    console.log('[MultiWhatsApp] Initializing all dormant connections...');
    const { data: connections, error } = await supabase
      .from('whatsapp_connections')
      .select('*');

    if (error) {
      console.error('Error fetching all connections:', error);
      return;
    }

    for (const conn of connections || []) {
      await this.initializeConnection(conn);
    }
  }

  // Initialize all connections for a user
  async initializeUserConnections(userId: string) {
    const { data: connections, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user connections:', error);
      return;
    }

    for (const conn of connections || []) {
      await this.initializeConnection(conn);
    }
  }

  // Initialize a single connection
  async initializeConnection(connectionData: any) {
    const connection: WhatsAppConnection = {
      id: connectionData.id,
      userId: connectionData.user_id,
      organizationId: connectionData.organization_id,
      displayName: connectionData.display_name,
      phoneNumber: connectionData.phone_number,
      status: 'disconnected',
      authStatePath: `auth_info_${connectionData.id}`
    };

    this.connections.set(connectionData.id, connection);

    // Initial load: only connect if auth state exists (to avoid headless QR generation on startup)
    if (connection.authStatePath && fs.existsSync(connection.authStatePath)) {
      await this.connectSocket(connection);
    }
  }

  // Force start a connection (e.g. to get a QR code)
  async startConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error('Conexión no encontrada');

    // If already connected, do nothing
    if (connection.status === 'connected' && connection.socket) return;

    await this.connectSocket(connection);
  }

  // Create new WhatsApp connection for user
  async createConnection(userId: string, displayName: string) {
    // Check user's connection limit
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('whatsapp_connections_limit, active_whatsapp_connections')
      .eq('id', userId)
      .single();

    if (userError) {
      console.warn('[MultiWhatsApp] Warning: WhatsApp limit columns missing or user not found. Using defaults.', userError.message);
    }

    const connectionsLimit = user?.whatsapp_connections_limit ?? 3;
    const activeConnections = user?.active_whatsapp_connections ?? 0;

    if (activeConnections >= connectionsLimit) {
      throw new Error('Has alcanzado tu límite de conexiones WhatsApp');
    }

    // Get organization ID
    const { data: orgUser } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!orgUser) {
      throw new Error('Usuario no encontrado en organización');
    }

    // Create connection record
    const { data: connection, error } = await supabase
      .from('whatsapp_connections')
      .insert({
        user_id: userId,
        organization_id: orgUser.organization_id,
        display_name: displayName,
        status: 'disconnected'
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error creando conexión: ' + error.message);
    }

    // Update user's active connections count
    if (user && user.active_whatsapp_connections !== undefined) {
      await supabase
        .from('users')
        .update({ active_whatsapp_connections: (user?.active_whatsapp_connections || 0) + 1 })
        .eq('id', userId);
    }

    await this.initializeConnection(connection);
    return connection;
  }

  // Connect socket for a specific connection
  private async connectSocket(connection: WhatsAppConnection) {
    try {
      if (!connection.authStatePath) {
        throw new Error('Auth state path not defined');
      }

      const { state, saveCreds } = await useMultiFileAuthState(connection.authStatePath);
      const { version } = await fetchLatestBaileysVersion();

      connection.socket = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        logger: this.logger,
      });

      connection.socket.ev.on('creds.update', saveCreds);

      connection.socket.ev.on('connection.update', (update: any) => {
        const { connection: connStatus, lastDisconnect, qr } = update;

        if (qr) {
          connection.qr = qr;
          connection.status = 'connecting';
          this.updateConnectionStatus(connection.id, 'connecting', qr);
        }

        if (connStatus === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          connection.status = 'error';
          connection.qr = undefined;
          this.updateConnectionStatus(connection.id, 'error');
          
          if (shouldReconnect) {
            setTimeout(() => this.connectSocket(connection), 5000);
          }
        } else if (connStatus === 'open') {
          const userJid = connection.socket.user?.id;
          const phoneNumber = userJid ? userJid.split(':')[0].split('@')[0] : undefined;
          
          connection.status = 'connected';
          connection.qr = undefined;
          connection.phoneNumber = phoneNumber;
          connection.lastConnectedAt = new Date();
          
          this.updateConnectionStatus(connection.id, 'connected', undefined, phoneNumber);
        }
      });

      connection.socket.ev.on('messages.upsert', async (m: { messages: proto.IWebMessageInfo[], type: string }) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (msg.key && !msg.key.fromMe && msg.message) {
              await this.processIncomingMessage(msg, connection);
            }
          }
        }
      });

    } catch (error) {
      console.error(`Error connecting socket for ${connection.id}:`, error);
      connection.status = 'error';
      this.updateConnectionStatus(connection.id, 'error');
    }
  }

  // Process incoming message for a specific connection
  private async processIncomingMessage(msg: proto.IWebMessageInfo, connection: WhatsAppConnection) {
    try {
      const senderPhone = this.extractPhoneNumber(msg);
      if (!senderPhone) {
        console.log('[MultiWhatsApp] Could not extract phone number from message');
        return;
      }

      console.log(`[MultiWhatsApp] Incoming message from ${senderPhone} on connection ${connection.displayName}`);

      // Format message for flow engine
      const formattedMessage = this.formatMessage(msg, senderPhone);

      // 3. ALWAYS save to history
      const profileName = msg.pushName || '';
      const { contact, conversation } = await this.saveMessageData(formattedMessage, senderPhone, connection, null, profileName);

      // 4. Delegate to flow engine (it will smartly resolve the correct bot assignment or fallback)
      const organizationConfig = {
        organizationId: connection.organizationId,
        conversationId: conversation?.id || undefined,
        contactId: contact?.id || undefined,
        whatsappConnectionId: connection.id,
        senderJid: msg.key?.remoteJid || undefined
      };

      await handleIncomingMessage(formattedMessage, senderPhone, organizationConfig, this.createWaServiceAdapter(connection));

    } catch (error) {
      console.error(`Error processing message for connection ${connection.id}:`, error);
    }
  }

  private extractPhoneNumber(msg: proto.IWebMessageInfo): string {
    if (!msg.key?.remoteJid) return '';
    
    const remoteJid = msg.key.remoteJid;
    const remoteJidAlt = (msg.key as any)?.remoteJidAlt;
    const messageContent = msg.message;
    const senderPn = (messageContent as any)?.senderPn || (messageContent as any)?.protocolMessage?.senderPn;

    if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
      return remoteJidAlt.split('@')[0];
    } else if (senderPn) {
      return senderPn.split('@')[0];
    } else if (remoteJid && !remoteJid.endsWith('@lid')) {
      return remoteJid.split('@')[0].split(':')[0];
    }
    return remoteJid ? remoteJid.split('@')[0] : '';
  }

  private formatMessage(msg: proto.IWebMessageInfo, senderPhone: string): any {
    if (!msg.message) {
      return {
        id: msg.key?.id || '',
        from: senderPhone,
        type: 'text'
      };
    }

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonReply = msg.message?.buttonsResponseMessage;

    let formattedMessage: any = {
      id: msg.key?.id || '',
      from: senderPhone,
      type: 'text'
    };

    if (text) {
      const cleanText = text.trim();
      const numberMatch = cleanText.match(/^(\d+)$/);
      
      if (numberMatch) {
        formattedMessage.type = 'text';
        formattedMessage.text = { body: text };
        formattedMessage.isNumericButtonResponse = true;
        formattedMessage.buttonNumber = numberMatch[1];
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
    }

    formattedMessage.jid = msg.key?.remoteJid || `${senderPhone}@s.whatsapp.net`;

    return formattedMessage;
  }

  private async saveMessageData(message: any, senderPhone: string, connection: WhatsAppConnection, flow: any, profileName: string = ''): Promise<{contact: any, conversation: any}> {
    // Similar to existing logic but using connection-specific organization
    const { data: contact } = await supabase
      .from('contacts')
      .upsert({
        organization_id: connection.organizationId,
        phone_number: senderPhone,
        profile_name: profileName, 
        last_active_at: new Date().toISOString()
      }, { onConflict: 'organization_id,phone_number' })
      .select()
      .single();

    let { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('organization_id', connection.organizationId)
      .eq('contact_id', contact.id)
      .eq('whatsapp_connection_id', connection.id)
      .order('last_message_at', { ascending: false })
      .limit(1);

    let conversation = conversations && conversations.length > 0 ? conversations[0] : null;

    if (!conversation) {
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          organization_id: connection.organizationId,
          contact_id: contact.id,
          whatsapp_connection_id: connection.id
        })
        .select()
        .single();
      conversation = newConversation;
    }

    await supabase.from('messages').insert({
      organization_id: connection.organizationId,
      conversation_id: conversation.id,
      contact_id: contact.id,
      direction: 'inbound',
      type: message.type,
      content: JSON.stringify(message),
      whatsapp_message_id: message.id
    });

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return { contact, conversation };
  }

  public createWaServiceAdapter(connection: WhatsAppConnection) {
    return {
      sendTextMessage: async (to: string, body: string, options?: { jid?: string }) => {
        const jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
        return await connection.socket?.sendMessage(jid, { text: body });
      },
      sendButtonMessage: async (to: string, bodyText: string, buttons: any[], options?: { jid?: string }) => {
        const jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
        const numberedOptions = buttons.map((btn, index) => `${index + 1}. ${btn.title}`).join('\n');
        const fullMessage = `${bodyText}\n\n${numberedOptions}\n\n💡 *Responde con el número de tu opción*`;
        return await connection.socket?.sendMessage(jid, { text: fullMessage });
      },
      sendMediaMessage: async (to: string, url: string, options?: any) => {
        const jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
        const ext = url.split('.').pop()?.toLowerCase() || '';
        const type = options?.type || (['png', 'jpg', 'jpeg'].includes(ext) ? 'image' : 'document');
        
        if (type === 'image') {
          return await connection.socket?.sendMessage(jid, { image: { url }, caption: options?.caption });
        }
        // Add other media types as needed
        return await connection.socket?.sendMessage(jid, { document: { url }, caption: options?.caption });
      }
    };
  }

  private async updateConnectionStatus(connectionId: string, status: string, qr?: string, phoneNumber?: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.status = status as any;
    if (qr) connection.qr = qr;
    if (phoneNumber) connection.phoneNumber = phoneNumber;

    const updateData: any = { 
      status, 
      qr_code: qr || null,
      last_connected_at: status === 'connected' ? new Date().toISOString() : null
    };

    if (phoneNumber) {
      updateData.phone_number = phoneNumber;
    }

    await supabase
      .from('whatsapp_connections')
      .update(updateData)
      .eq('id', connectionId);
  }

  // Public methods
  async getConnectionQR(connectionId: string, userId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.userId !== userId) {
      throw new Error('Conexión no encontrada');
    }

    if (connection.status === 'disconnected') {
      await this.connectSocket(connection);
    }

    // Generate QR image
    if (connection.qr) {
      const QRCode = await import('qrcode');
      return await QRCode.toDataURL(connection.qr);
    }

    return null;
  }

  async deleteConnection(connectionId: string, userId: string) {
    const connection = this.connections.get(connectionId);
    
    // Even if not in memory, we should try to delete from DB
    // But we need the userId to be sure we're deleting the right one
    
    if (connection) {
      // Disconnect socket if exists
      if (connection.socket) {
        try {
          await connection.socket.logout();
        } catch (err) {
          console.error('Error during socket logout:', err);
        }
      }

      // Clean up auth state
      if (connection.authStatePath && fs.existsSync(connection.authStatePath)) {
        try {
          fs.rmSync(connection.authStatePath, { recursive: true, force: true });
        } catch (err) {
          console.error('Error removing auth state:', err);
        }
      }
      
      this.connections.delete(connectionId);
    }

    // Always attempt to delete from database if we have the userId
    const { error: dbError } = await supabase
      .from('whatsapp_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Error deleting connection from DB:', dbError);
    }

    // Update user's active connections count
    const { data: user } = await supabase
      .from('users')
      .select('active_whatsapp_connections')
      .eq('id', userId)
      .single();

    if (user && user.active_whatsapp_connections !== undefined) {
      await supabase
        .from('users')
        .update({ active_whatsapp_connections: Math.max(0, user.active_whatsapp_connections - 1) })
        .eq('id', userId);
    }

    this.connections.delete(connectionId);
  }

  getUserConnections(userId: string) {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId);
  }

  getOrganizationConnections(organizationId: string) {
    return Array.from(this.connections.values()).filter(conn => conn.organizationId === organizationId);
  }

  getConnection(connectionId: string) {
    return this.connections.get(connectionId);
  }
}

export const multiWhatsAppService = new MultiWhatsAppService();
