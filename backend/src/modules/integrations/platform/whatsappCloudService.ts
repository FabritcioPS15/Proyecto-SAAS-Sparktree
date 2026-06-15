/**
 * WhatsApp Cloud API Service
 * Integration with Meta's WhatsApp Business API for multi-platform support
 */

import axios from 'axios';
import { BasePlatformService, PlatformConnection, PlatformMessage, PlatformServiceAdapter } from './basePlatformService';
import { supabase } from '../../../core/config/supabase';
import { handleIncomingMessage } from '../../bots/engine/flow-core';

export class WhatsAppCloudService extends BasePlatformService {
  private webhookVerifyTokens: Map<string, string> = new Map();

  getPlatformType(): 'whatsapp' | 'telegram' | 'instagram' | 'tiktok' | 'facebook_messenger' | 'mercadolibre' {
    return 'whatsapp';
  }

  async initializeConnection(connectionData: any): Promise<void> {
    const connection: PlatformConnection = {
      id: connectionData.id,
      userId: connectionData.user_id,
      organizationId: connectionData.organization_id,
      platformType: 'whatsapp',
      displayName: connectionData.display_name,
      platformAccountId: connectionData.phone_number_id,
      status: connectionData.status || 'disconnected',
      config: {
        phoneNumberId: connectionData.phone_number_id,
        accessToken: connectionData.access_token,
        webhookVerifyToken: connectionData.webhook_verify_token,
      },
      lastConnectedAt: connectionData.last_connected_at ? new Date(connectionData.last_connected_at) : undefined,
    };

    this.connections.set(connection.id, connection);
    
    // Store verify token for webhook verification
    if (connection.config.webhookVerifyToken) {
      this.webhookVerifyTokens.set(connection.id, connection.config.webhookVerifyToken);
    }
  }

  async startConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error('Connection not found');

    // For Cloud API, connection is always "connected" if credentials are valid
    connection.status = 'connected';
    connection.lastConnectedAt = new Date();

    await this.updateConnectionStatus(connectionId, 'connected');
  }

  async deleteConnection(connectionId: string, userId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    this.connections.delete(connectionId);
    this.webhookVerifyTokens.delete(connectionId);

    // Delete from database
    await supabase
      .from('platform_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', userId);
  }

  async processIncomingMessage(rawMessage: any, connection: PlatformConnection): Promise<void> {
    try {
      const message = this.formatPlatformMessage(rawMessage);
      if (!message) return;

      const senderPhone = message.from;
      
      // Save to database
      const { data: contact } = await supabase
        .from('contacts')
        .upsert({
          organization_id: connection.organizationId,
          phone_number: senderPhone,
          profile_name: rawMessage.contact?.name || '',
          last_active_at: new Date().toISOString(),
          custom_attributes: {
            platform: 'whatsapp_cloud',
            connection_id: connection.id,
          },
        })
        .select()
        .single();

      if (!contact) return;

      // Get or create conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('organization_id', connection.organizationId)
        .eq('contact_id', contact.id)
        .eq('platform_connection_id', connection.id)
        .single();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            organization_id: connection.organizationId,
            contact_id: contact.id,
            platform_connection_id: connection.id,
          })
          .select()
          .single();
        conversation = newConv;
      }

      // Save message
      await supabase.from('messages').insert({
        organization_id: connection.organizationId,
        conversation_id: conversation.id,
        contact_id: contact.id,
        direction: 'inbound',
        type: message.type,
        content: JSON.stringify(message),
        platform_message_id: message.id,
      });

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      // Process with flow engine
      const organizationConfig = {
        organizationId: connection.organizationId,
        conversationId: conversation.id,
        contactId: contact.id,
        whatsappConnectionId: connection.id,
      };

      const serviceAdapter = this.createServiceAdapter(connection);
      await handleIncomingMessage(message, senderPhone, organizationConfig, serviceAdapter);

    } catch (error) {
      console.error('[WhatsApp Cloud] Error processing message:', error);
    }
  }

  createServiceAdapter(connection: PlatformConnection): PlatformServiceAdapter {
    const config = connection.config;

    return {
      sendTextMessage: async (to: string, body: string, options?: any) => {
        const phoneNumber = to.includes('@') ? to.split('@')[0] : to;
        const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
        
        const response = await axios({
          method: 'POST',
          url,
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body },
          },
        });

        return response.data;
      },

      sendButtonMessage: async (to: string, bodyText: string, buttons: any[], options?: any) => {
        const phoneNumber = to.includes('@') ? to.split('@')[0] : to;
        const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
        
        const actionButtons = buttons.slice(0, 3).map((btn, index) => ({
          type: 'reply',
          reply: {
            id: btn.id || `btn_${index}`,
            title: btn.title || btn.text || `Option ${index + 1}`,
          },
        }));

        const response = await axios({
          method: 'POST',
          url,
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: bodyText },
              action: { buttons: actionButtons },
            },
          },
        });

        return response.data;
      },

      sendMediaMessage: async (to: string, url: string, options?: any) => {
        const phoneNumber = to.includes('@') ? to.split('@')[0] : to;
        const apiUrl = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
        
        const mediaType = options?.type || 'image';
        
        const response = await axios({
          method: 'POST',
          url,
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: mediaType,
            [mediaType]: {
              link: url,
              caption: options?.caption,
            },
          },
        });

        return response.data;
      },
    };
  }

  async handleWebhook(req: any, res: any): Promise<void> {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const value = change.value;
              
              if (value.messages && value.messages.length > 0) {
                const message = value.messages[0];
                const phoneId = value.metadata.phone_number_id;

                // Find connection by phone number ID
                const connection = Array.from(this.connections.values()).find(
                  conn => conn.config.phoneNumberId === phoneId
                );

                if (connection) {
                  await this.processIncomingMessage(message, connection);
                }
              }
            }
          }
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error('[WhatsApp Cloud] Webhook error:', error);
      res.sendStatus(500);
    }
  }

  async verifyWebhook(req: any, res: any): Promise<void> {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check against all stored verify tokens
    const isValidToken = Array.from(this.webhookVerifyTokens.values()).includes(token);

    if (mode && token) {
      if (mode === 'subscribe' && isValidToken) {
        console.log('[WhatsApp Cloud] Webhook verified');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  }

  async getConnectionStatus(connectionId: string): Promise<any> {
    const connection = this.connections.get(connectionId);
    if (!connection) return null;

    // Verify credentials by making a test API call
    try {
      const url = `https://graph.facebook.com/v18.0/${connection.config.phoneNumberId}`;
      await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${connection.config.accessToken}`,
        },
      });

      return {
        status: 'connected',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Invalid credentials',
        lastChecked: new Date(),
      };
    }
  }

  private formatPlatformMessage(rawMessage: any): PlatformMessage | null {
    if (!rawMessage) return null;

    const message: PlatformMessage = {
      id: rawMessage.id,
      from: rawMessage.from,
      type: 'text',
      raw: rawMessage,
    };

    if (rawMessage.type === 'text' && rawMessage.text?.body) {
      message.text = rawMessage.text.body;
      message.type = 'text';
    } else if (rawMessage.type === 'image') {
      message.type = 'media';
      message.media = {
        type: 'image',
        url: rawMessage.image?.url,
        caption: rawMessage.image?.caption,
      };
    } else if (rawMessage.type === 'video') {
      message.type = 'media';
      message.media = {
        type: 'video',
        url: rawMessage.video?.url,
        caption: rawMessage.video?.caption,
      };
    } else if (rawMessage.type === 'document') {
      message.type = 'media';
      message.media = {
        type: 'document',
        url: rawMessage.document?.url,
        caption: rawMessage.document?.caption,
      };
    } else if (rawMessage.type === 'interactive') {
      message.type = 'interactive';
      if (rawMessage.interactive?.button_reply) {
        message.interactive = {
          type: 'button_reply',
          button_reply: {
            id: rawMessage.interactive.button_reply.id,
            title: rawMessage.interactive.button_reply.title,
          },
        };
      }
    }

    return message;
  }

  private async updateConnectionStatus(connectionId: string, status: string): Promise<void> {
    await supabase
      .from('platform_connections')
      .update({
        status,
        last_connected_at: status === 'connected' ? new Date().toISOString() : null,
      })
      .eq('id', connectionId);
  }
}

export const whatsappCloudService = new WhatsAppCloudService();
