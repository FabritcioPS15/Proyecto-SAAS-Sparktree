import express from 'express';
import { supabase } from '../config/supabase';
import { multiWhatsAppService } from '../services/multiWhatsAppService';

const router = express.Router();

// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    console.log(`[Conversations API] Fetching conversations for org: ${orgId}`);
    
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, contacts(phone_number, profile_name, profile_picture)')
      .eq('organization_id', orgId)
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
        name: (conv.contacts?.profile_name && conv.contacts.profile_name !== 'Sin nombre') 
          ? conv.contacts.profile_name 
          : (conv.contacts?.phone_number || 'Sin nombre'),
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
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .eq('organization_id', orgId)
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

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Get conversation with contact phone and JID
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, contacts(phone_number, custom_attributes)')
      .eq('id', id)
      .eq('organization_id', orgId)
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
    // Simplemente usamos los dígitos y confiamos en el formato internacional que envía WhatsApp
    const cleanPhone = storedPhone.replace(/\D/g, '');
    let correctedPhone = cleanPhone;
    
    console.log(`[Conversations] Original stored phone: ${storedPhone}`);
    console.log(`[Conversations] Cleaned phone: ${cleanPhone} (${cleanPhone.length} digits)`);
    
    // Si el número tiene 9 dígitos y no empieza con código de país, asumimos que es de Perú
    if (cleanPhone.length === 9 && !cleanPhone.startsWith('51')) {
      correctedPhone = '51' + cleanPhone;
      console.log(`[Conversations] Converted 9-digit number to Peruvian format: ${correctedPhone}`);
    } else {
      console.log(`[Conversations] Using phone as-is (already has country code or non-standard): ${correctedPhone}`);
    }
    
    console.log(`[Conversations] Final corrected phone: ${correctedPhone}`);

    // Send via WhatsApp
    const connections = (multiWhatsAppService as any).getOrganizationConnections(orgId);
    const activeConn = connections.find((c: any) => c.status === 'connected');
    
    if (!activeConn) {
      return res.status(503).json({ error: 'WhatsApp no está conectado para esta organización. Por favor conecta el dispositivo primero.' });
    }

    const contactJid = (conversation.contacts as any)?.custom_attributes?.whatsapp_jid;
    const adapter = (multiWhatsAppService as any).createWaServiceAdapter(activeConn);
    await adapter.sendTextMessage(correctedPhone, text.trim(), { jid: contactJid });

    // Save message to DB
    const { data: savedMessage } = await supabase
      .from('messages')
      .insert({
        organization_id: orgId,
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
      .eq('id', id)
      .eq('organization_id', orgId);

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
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', req.params.id)
      .eq('organization_id', orgId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;


