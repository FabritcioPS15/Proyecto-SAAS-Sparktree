import { Request, Response } from 'express';
import { handleIncomingMessage } from '../bots/engine/flow-core';
import { supabase } from '../../core/config/supabase';
import WhatsAppService from '../integrations/whatsappService';

/**
 * Validates the WhatsApp Webhook Verification Request
 */
export const verifyWebhook = async (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (!mode || !token) {
    return res.status(400).send('Missing parameters');
  }

  if (mode !== 'subscribe') {
    return res.sendStatus(403);
  }

  // Check against ALL organizations' verify tokens (multi-tenant)
  const { data: orgs } = await supabase
    .from('organizations')
    .select('whatsapp_verify_token')
    .not('whatsapp_verify_token', 'is', null);

  const orgTokens = (orgs || []).map(o => o.whatsapp_verify_token).filter(Boolean);

  // Also check platform_connections config.webhook_verify_token
  const { data: platformConns } = await supabase
    .from('platform_connections')
    .select('config')
    .eq('platform_type', 'whatsapp')
    .eq('status', 'connected');

  const platformTokens = (platformConns || [])
    .map(c => c.config?.webhook_verify_token)
    .filter(Boolean);

  const allTokens = [...new Set([...orgTokens, ...platformTokens, process.env.WHATSAPP_VERIFY_TOKEN, 'sparktree_webhook'].filter(Boolean))];

  if (allTokens.includes(token as string)) {
    console.log('[Webhook] Verified successfully');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] Verification failed for token:', token);
  return res.sendStatus(403);
};

/**
 * Handles incoming WhatsApp messages and status updates
 * Spec: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages
 */
export const handleIncomingWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Meta spec: always respond 200 first, then process
    // Webhook must acknowledge receipt quickly (within 20 seconds)
    res.sendStatus(200);

    // Validate object type per Meta spec
    if (body.object !== 'whatsapp_business_account') {
      console.log('[Webhook] Ignoring non-WhatsApp object:', body.object);
      return;
    }

    if (!body.entry?.[0]?.changes?.[0]) {
      return;
    }

    const change = body.entry[0].changes[0];
    const changeValue = change.value;

    // Process messages (Meta can send multiple messages in one payload)
    if (changeValue.messages && Array.isArray(changeValue.messages)) {
      for (const message of changeValue.messages) {
        await processIncomingMessage(message, changeValue);
      }
    }

    // Process status updates
    if (changeValue.statuses && Array.isArray(changeValue.statuses)) {
      for (const status of changeValue.statuses) {
        console.log(`[Webhook] Status update: ${status.status} for message ${status.id}`);
        // TODO: update message status in DB if needed
      }
    }
  } catch (error) {
    console.error('[Webhook] Error handling webhook:', error);
    // Don't send error response - we already sent 200
  }
};

/**
 * Process a single incoming message from the webhook payload
 */
async function processIncomingMessage(message: any, changeValue: any) {
  try {
    const senderPhone = message.from;
    const profileName = changeValue.contacts?.[0]?.profile?.name || '';
    const receivingPhoneId = changeValue.metadata.phone_number_id;

    // Ignore messages from groups
    if (message.participant || senderPhone.includes('@g.us')) {
      return;
    }

    console.log(`[Webhook] Message from ${senderPhone} (type: ${message.type})`);

    // Lookup organization by phone number ID
    let { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('whatsapp_phone_number_id', receivingPhoneId)
      .single();

    // Fallback: lookup via platform_connections (Cloud API stores phone_number_id there)
    if (!organization) {
      const { data: platformConn } = await supabase
        .from('platform_connections')
        .select('organization_id')
        .eq('platform_type', 'whatsapp')
        .eq('platform_account_id', receivingPhoneId)
        .eq('status', 'connected')
        .single();

      if (platformConn?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', platformConn.organization_id)
          .single();
        organization = org;
      }
    }

    // Final fallback to first org for testing
    if (!organization) {
      const { data: firstOrg } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
        .single();
      organization = firstOrg;
    }

    if (!organization) {
      console.warn('[Webhook] No organization found for phone_number_id:', receivingPhoneId);
      return;
    }

    // Upsert Contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert(
        {
          organization_id: organization.id,
          phone_number: senderPhone,
          profile_name: profileName,
          platform_type: 'whatsapp_cloud',
          last_active_at: new Date().toISOString()
        },
        { onConflict: 'organization_id,phone_number' }
      )
      .select()
      .single();

    if (contactError || !contact) {
      console.error('[Webhook] Error upserting contact:', contactError);
      return;
    }

    // Upsert Conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('contact_id', contact.id)
      .single();

    let connectionMethod = organization.whatsapp_connection_method || 'qr';
    let platformConnectionId: string | null = null;

    // Detect Cloud API from platform_connections
    {
      const { data: platformConn } = await supabase
        .from('platform_connections')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('platform_type', 'whatsapp')
        .eq('platform_account_id', receivingPhoneId)
        .eq('status', 'connected')
        .single();
      if (platformConn) {
        connectionMethod = 'cloud';
        platformConnectionId = platformConn.id;
      }
    }

    if (!conversation) {
      const insertData: any = { organization_id: organization.id, contact_id: contact.id };
      if (connectionMethod === 'cloud') {
        insertData.platform_type = 'whatsapp_cloud';
        insertData.platform_connection_id = platformConnectionId;
      }
      const { data: newConv } = await supabase
        .from('conversations')
        .insert(insertData)
        .select()
        .single();
      conversation = newConv;
    } else {
      // Update existing conversation - ensure platform_connection_id is set for Cloud API
      const updateData: any = { last_message_at: new Date().toISOString() };
      if (connectionMethod === 'cloud' && platformConnectionId && !conversation.platform_connection_id) {
        updateData.platform_type = 'whatsapp_cloud';
        updateData.platform_connection_id = platformConnectionId;
      }
      await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversation.id);
    }

    // Save Incoming Message
    await supabase.from('messages').insert({
      organization_id: organization.id,
      conversation_id: conversation?.id,
      contact_id: contact.id,
      direction: 'inbound',
      type: message.type || 'text',
      content: message.text?.body || JSON.stringify(message),
      whatsapp_message_id: message.id
    });

    // Process bot flow
    const organizationConfig = {
      organizationId: organization.id,
      conversationId: conversation?.id,
      contactId: contact.id
    };

    let waService;

    if (connectionMethod === 'cloud') {
      const { data: platformConn } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('platform_type', 'whatsapp')
        .eq('platform_account_id', receivingPhoneId)
        .eq('status', 'connected')
        .single();

      if (platformConn) {
        const { whatsappCloudService } = await import('../integrations/platform/whatsappCloudService');
        await whatsappCloudService.initializeConnection(platformConn);
        const cloudConn = whatsappCloudService['connections'].get(platformConn.id);
        if (cloudConn) {
          waService = whatsappCloudService.createServiceAdapter(cloudConn);
        }
      }
      if (!waService) {
        waService = new WhatsAppService({
          phoneNumberId: organization.whatsapp_phone_number_id || receivingPhoneId,
          accessToken: organization.whatsapp_access_token || ''
        });
      }
    } else {
      const { multiWhatsAppService } = await import('../integrations/multiWhatsAppService');
      const connections = multiWhatsAppService.getOrganizationConnections(organization.id);
      const activeConn = connections.find(c => c.status === 'connected');

      if (activeConn) {
        waService = multiWhatsAppService.createWaServiceAdapter(activeConn);
      } else {
        waService = new WhatsAppService({
          phoneNumberId: organization.whatsapp_phone_number_id || '',
          accessToken: organization.whatsapp_access_token || ''
        });
      }
    }

    await handleIncomingMessage(message, senderPhone, organizationConfig, waService);
  } catch (error) {
    console.error('[Webhook] Error processing message:', error);
  }
}
