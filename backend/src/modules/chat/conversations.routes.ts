import express from 'express';
import { supabase } from '../../core/config/supabase';
import { multiWhatsAppService } from '../integrations/multiWhatsAppService';

const router = express.Router();

// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    // 1. Fetch conversations + contacts (NO messages relation)
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, contact_id, last_message_at, status, created_at, platform_type, organization_id, contacts(phone_number, profile_name, profile_picture, custom_attributes)')
      .eq('organization_id', orgId)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Conversations API] DB Error:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    if (!conversations || conversations.length === 0) {
      return res.json([]);
    }

    // 2. Fetch last message for each conversation in a single query
    const convIds = conversations.map((c: any) => c.id);
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false });

    // Build a map: conversationId -> last message content
    const lastMsgMap = new Map<string, string>();
    if (lastMessages) {
      for (const msg of lastMessages) {
        if (!lastMsgMap.has(msg.conversation_id)) {
          lastMsgMap.set(msg.conversation_id, msg.content);
        }
      }
    }

    // 3. Format response (no more reduce over all messages)
    const formattedConversations = conversations.map((conv: any) => {
      const storedPhone = conv.contacts?.phone_number || '';
      const phoneDigits = storedPhone.replace(/\D/g, '');
      const isLidPhone = storedPhone.length > 15 || phoneDigits.length > 15;
      const displayPhone = isLidPhone ? '' : storedPhone;

      return {
        _id: conv.id,
        id: conv.id,
        contactId: {
          id: conv.contact_id,
          _id: conv.contact_id,
          phoneNumber: displayPhone || 'Desconocido',
          name: (conv.contacts?.profile_name && conv.contacts.profile_name !== 'Sin nombre')
            ? conv.contacts.profile_name
            : (displayPhone || 'Sin nombre'),
          profilePicture: conv.contacts?.profile_picture || null,
          isGroup: conv.contacts?.custom_attributes?.is_group ||
                   conv.contacts?.phone_number?.includes('-') ||
                   (displayPhone && displayPhone.length > 15)
        },
        lastMessageAt: conv.last_message_at,
        lastMessageContent: lastMsgMap.get(conv.id) || 'Sin mensajes',
        channel: conv.platform_type || 'whatsapp',
        unreadCount: 0,
        status: conv.status,
        createdAt: conv.created_at
      };
    });

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

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: messages } = await supabase
      .from('messages')
      .select('id, content, created_at, direction, type, status')
      .eq('conversation_id', req.params.id)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Return in chronological order
    const formattedMessages = (messages || []).reverse().map((msg: any) => ({
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
    const { text, mediaUrl, mediaType, caption } = req.body;

    if (!text && !mediaUrl) {
      return res.status(400).json({ error: 'El mensaje o el archivo no pueden estar vacíos' });
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
    
    if (mediaUrl) {
      // Send Media
      await adapter.sendMediaMessage(correctedPhone, mediaUrl, { 
        jid: contactJid, 
        type: mediaType || 'image',
        caption: text || caption || ''
      });
    } else {
      // Send Text
      await adapter.sendTextMessage(correctedPhone, text.trim(), { jid: contactJid });
    }

    // Save message to DB
    const { data: savedMessage } = await supabase
      .from('messages')
      .insert({
        organization_id: orgId,
        conversation_id: id,
        contact_id: conversation.contact_id,
        direction: 'outbound',
        type: mediaUrl ? (mediaType || 'image') : 'text',
        content: mediaUrl ? JSON.stringify({ url: mediaUrl, caption: text }) : (text || '').trim(),
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
      content: mediaUrl ? { url: mediaUrl, caption: text } : (text || '').trim(),
      createdAt: savedMessage?.created_at,
      type: mediaUrl ? (mediaType || 'image') : 'text',
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

// GET /api/contacts - Get all contacts with platform info
router.get('/contacts', async (req, res) => {
  try {
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', orgId)
      .order('last_active_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching contacts:', error);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }

    // Log para debug: ver qué datos están llegando
    if (contacts && contacts.length > 0) {
      console.log('[Contacts API] First contact:', contacts[0]);
    }

    res.json(contacts || []);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

export default router;


