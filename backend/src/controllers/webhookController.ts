import { Request, Response } from 'express';
import { handleIncomingMessage } from '../flows';
import { supabase } from '../config/supabase';
import WhatsAppService from '../services/whatsappService';

/**
 * Validates the WhatsApp Webhook Verification Request
 */
export const verifyWebhook = async (req: Request, res: Response) => {
  // Get verify token from the first organization in DB
  const { data: org } = await supabase.from('organizations').select('*').limit(1).single();
  const VERIFY_TOKEN = org?.whatsapp_verify_token || process.env.WHATSAPP_VERIFY_TOKEN || 'my_webhook_secret';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Missing parameters');
  }
};

/**
 * Handles incoming WhatsApp messages and status updates
 */
export const handleIncomingWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const changeValue = body.entry[0].changes[0].value;
        const message = changeValue.messages[0];
        const senderPhone = message.from;
        const profileName = changeValue.contacts?.[0]?.profile?.name || '';
        const receivingPhoneId = changeValue.metadata.phone_number_id;

        console.log(`Mensaje recibido de ${senderPhone}:`, JSON.stringify(message, null, 2));

        // Lookup organization by phone number ID
        let { data: organization } = await supabase
          .from('organizations')
          .select('*')
          .eq('whatsapp_phone_number_id', receivingPhoneId)
          .single();

        // Fallback to first org for testing
        if (!organization) {
          const { data: firstOrg } = await supabase
            .from('organizations')
            .select('*')
            .limit(1)
            .single();
          organization = firstOrg;
        }

        if (organization) {
          // Upsert Contact (find or create)
          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .upsert(
              {
                organization_id: organization.id,
                phone_number: senderPhone,
                profile_name: profileName,
                last_active_at: new Date().toISOString()
              },
              { onConflict: 'organization_id,phone_number' }
            )
            .select()
            .single();

          if (contactError || !contact) {
            console.error('Error upserting contact:', contactError);
            return res.sendStatus(500);
          }

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
              .select()
              .single();
            conversation = newConv;
          } else {
            await supabase
              .from('conversations')
              .update({ last_message_at: new Date().toISOString() })
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
            phoneNumberId: organization.whatsapp_phone_number_id || '',
            accessToken: organization.whatsapp_access_token || '',
            conversationId: conversation?.id,
            contactId: contact.id
          };
          const waService = new WhatsAppService(organizationConfig);
          await handleIncomingMessage(message, senderPhone, organizationConfig, waService);
        }
      }

      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
        const statuses = body.entry[0].changes[0].value.statuses;
        console.log('Status update received:', statuses[0].status);
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.sendStatus(500);
  }
};
