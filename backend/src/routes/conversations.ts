import express from 'express';
import { supabase } from '../config/supabase';
import { qrService } from '../services/whatsappQRService';

const router = express.Router();

// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    console.log('[Conversations API] Fetching conversations...');
    
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, contacts(phone_number, profile_name, profile_picture)')
      .order('last_message_at', { ascending: false });

    console.log('[Conversations API] DB Response:');
    console.log('  - Error:', error);
    console.log('  - Data length:', conversations?.length || 0);
    
    if (conversations && conversations.length > 0) {
      console.log('  - First conversation:', conversations[0]);
    }

    const formattedConversations = (conversations || []).map((conv: any) => ({
      _id: conv.id,
      id: conv.id,
      contactId: {
        phoneNumber: conv.contacts?.phone_number || 'Desconocido',
        name: conv.contacts?.profile_name || 'Sin nombre',
        profilePicture: conv.contacts?.profile_picture || null
      },
      lastMessageAt: conv.last_message_at,
      unreadCount: 0,
      status: conv.status,
      createdAt: conv.created_at
    }));

    console.log('[Conversations API] Formatted conversations:', formattedConversations.length);
    res.json(formattedConversations);
  } catch (error) {
    console.error('[Conversations API] Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    const formattedMessages = (messages || []).map((msg: any) => ({
      _id: msg.id,
      direction: msg.direction,
      content: msg.content,
      createdAt: msg.created_at,
      type: msg.type,
      status: msg.status
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/conversations/:id/send  — send a message to a contact via WhatsApp
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    // Get conversation with contact phone
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, contacts(phone_number)')
      .eq('id', id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    // Obtener el número real del contacto de la conversación
    // El número en la BD puede estar mal formateado, pero el bot debería responder al número real
    const storedPhone = conversation.contacts?.phone_number;
    if (!storedPhone) {
      return res.status(400).json({ error: 'El contacto no tiene número de teléfono' });
    }

    // Corregir el número usando el mismo sistema que el bot
    let correctedPhone = storedPhone;
    const cleanPhone = storedPhone.replace(/\D/g, '');
    
    console.log(`[Conversations] Original stored phone: ${storedPhone}`);
    console.log(`[Conversations] Cleaned phone: ${cleanPhone} (${cleanPhone.length} digits)`);
    
    // Usar el mismo sistema de corrección automática que el bot
    if (cleanPhone.length === 8) {
      correctedPhone = '511' + cleanPhone;
      console.log(`[Conversations] Converted 8-digit Peruvian phone to: ${correctedPhone}`);
    } else if (cleanPhone.length === 9) {
      correctedPhone = '51' + cleanPhone;
      console.log(`[Conversations] Converted 9-digit Peruvian phone to: ${correctedPhone}`);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('51')) {
      correctedPhone = cleanPhone;
      console.log(`[Conversations] Peruvian number already in correct format: ${correctedPhone}`);
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('51')) {
      const realNumber = cleanPhone.substring(3);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted 9-digit number from 12-digit format: ${realNumber}`);
      console.log(`[Conversations] Converted to: ${correctedPhone}`);
    } else if (cleanPhone.length === 13 && cleanPhone.startsWith('51')) {
      const realNumber = cleanPhone.substring(4);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted 9-digit number from 13-digit format: ${realNumber}`);
      console.log(`[Conversations] Converted to: ${correctedPhone}`);
    } else if (cleanPhone.length === 15 && cleanPhone.startsWith('51')) {
      const realNumber = cleanPhone.substring(6);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted 9-digit number from 15-digit format: ${realNumber}`);
      console.log(`[Conversations] Converted to: ${correctedPhone}`);
    } else if (cleanPhone.length === 15) {
      const realNumber = cleanPhone.substring(cleanPhone.length - 9);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted last 9 digits from 15-digit number: ${realNumber}`);
      console.log(`[Conversations] Converted to Peruvian format: ${correctedPhone}`);
    } else if (cleanPhone.length === 14) {
      const realNumber = cleanPhone.substring(cleanPhone.length - 9);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted last 9 digits from 14-digit number: ${realNumber}`);
      console.log(`[Conversations] Converted to Peruvian format: ${correctedPhone}`);
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('15')) {
      correctedPhone = '51' + cleanPhone.substring(2);
      console.log(`[Conversations] Converted Peruvian mobile to: ${correctedPhone}`);
    } else if (cleanPhone.length > 9 && cleanPhone.startsWith('9')) {
      const realNumber = cleanPhone.substring(cleanPhone.length - 9);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted last 9 digits from long number starting with 9: ${realNumber}`);
      console.log(`[Conversations] Converted to Peruvian format: ${correctedPhone}`);
    } else if (cleanPhone.length > 9) {
      const realNumber = cleanPhone.substring(cleanPhone.length - 9);
      correctedPhone = '51' + realNumber;
      console.log(`[Conversations] Extracted last 9 digits from long number: ${realNumber}`);
      console.log(`[Conversations] Converted to Peruvian format: ${correctedPhone}`);
    } else if (cleanPhone.length === 7) {
      correctedPhone = '511' + cleanPhone;
      console.log(`[Conversations] Converted 7-digit Peruvian phone to: ${correctedPhone}`);
    } else {
      console.log(`[Conversations] Phone format not recognized, using original: ${correctedPhone}`);
    }
    
    console.log(`[Conversations] Final corrected phone: ${correctedPhone}`);

    // Send via WhatsApp
    const status = qrService.getStatus();
    if (status !== 'connected') {
      return res.status(503).json({ error: 'WhatsApp no está conectado. Por favor conecta el dispositivo primero.' });
    }

    await qrService.sendTextMessage(correctedPhone, text.trim());

    // Get org id
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();

    // Save message to DB
    const { data: savedMessage } = await supabase
      .from('messages')
      .insert({
        organization_id: org?.id,
        conversation_id: id,
        contact_id: conversation.contact_id,
        direction: 'outbound',
        type: 'text',
        content: text.trim(),
        status: 'sent'
      })
      .select()
      .single();

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', id);

    res.json({
      _id: savedMessage?.id,
      direction: 'outbound',
      content: text.trim(),
      createdAt: savedMessage?.created_at,
      type: 'text',
      status: 'sent'
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message || 'Error al enviar el mensaje' });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;


