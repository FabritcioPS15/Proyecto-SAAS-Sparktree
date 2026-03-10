import { Request, Response } from 'express';
import { handleIncomingMessage } from '../flows';

import Organization from '../models/Organization';
import Contact from '../models/Contact';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

/**
 * Validates the WhatsApp Webhook Verification Request
 */
export const verifyWebhook = async (req: Request, res: Response) => {
  // En producción, este token debe venir de las variables de entorno o la DB
  // Buscamos la organización por defecto o alguna que corresponda
  const org = await Organization.findOne();
  const VERIFY_TOKEN = org?.whatsappConfig?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || "my_webhook_secret";

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

    // Check if it's a WhatsApp status update or message
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        
        const changeValue = body.entry[0].changes[0].value;
        const message = changeValue.messages[0];
        const senderPhone = message.from;
        const profileName = changeValue.contacts?.[0]?.profile?.name || '';
        
        // Metadata contains the exact WhatsApp Business number that received the message
        const receivingPhoneId = changeValue.metadata.phone_number_id;

        console.log(`Mensaje recibido de ${senderPhone}:`, JSON.stringify(message, null, 2));

        // In a multi-tenant SaaS, you look up the organization by `receivingPhoneId`
        let organization = await Organization.findOne({ "whatsappConfig.phoneNumberId": receivingPhoneId });
        
        // Fallback to first org if not found (for testing/single tenant)
        if (!organization) {
           organization = await Organization.findOne();
        }

        if (organization) {
           // Find or Create Contact
           let contact = await Contact.findOne({ organizationId: organization._id, phoneNumber: senderPhone });
           if (!contact) {
             contact = new Contact({
               organizationId: organization._id,
               phoneNumber: senderPhone,
               profileName: profileName
             });
           } else {
             contact.lastActiveAt = new Date();
             if (profileName) contact.profileName = profileName;
           }
           await contact.save();

           // Find or Create Conversation
           let conversation = await Conversation.findOne({ organizationId: organization._id, contactId: contact._id });
           if (!conversation) {
             conversation = new Conversation({
                organizationId: organization._id,
                contactId: contact._id
             });
           } else {
             conversation.lastMessageAt = new Date();
           }
           await conversation.save();

           // Save Incoming Message
           const incomingMsg = new Message({
             organizationId: organization._id,
             conversationId: conversation._id,
             contactId: contact._id,
             direction: 'inbound',
             type: message.type || 'text',
             content: message.text || message,
             whatsappMessageId: message.id
           });
           await incomingMsg.save();

           // Validar si el bot está activo
           if (organization.settings?.botEnabled) {
             // Pass message to flow handler
             const organizationConfig = {
               phoneNumberId: organization.whatsappConfig?.phoneNumberId || '',
               accessToken: organization.whatsappConfig?.accessToken || '',
               organizationId: organization._id.toString(),
               conversationId: conversation._id.toString(),
               contactId: contact._id.toString()
             };
             await handleIncomingMessage(message, senderPhone, organizationConfig);
           }
        }
      }

      // Handle message statuses (sent, delivered, read) to update analytics
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
         const statuses = body.entry[0].changes[0].value.statuses;
         console.log('Status update received:', statuses[0].status);
         // TODO: Update Message document in MongoDB with new status
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
