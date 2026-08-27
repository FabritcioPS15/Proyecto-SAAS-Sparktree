import express from 'express';
import { supabase } from '../../core/config/supabase';

const router = express.Router();

// GET /api/inbox/pending - Obtener mensajes pendientes de atención manual
router.get('/pending', async (req: any, res) => {
  try {
    const orgId = req.organizationId || req.user?.organization_id;
    
    const { data: pendingMessages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        contact_id,
        conversation_id,
        contacts (name, phone),
        conversations (id)
      `)
      .eq('organization_id', orgId)
      .eq('direction', 'inbound')
      .eq('status', 'pending_manual')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ messages: pendingMessages || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inbox/reply - Responder manualmente a un mensaje
router.post('/reply', async (req: any, res) => {
  try {
    const orgId = req.organizationId || req.user?.organization_id;
    const { message_id, conversation_id, contact_id, reply_text, agent_id } = req.body;

    // 1. Enviar respuesta por WhatsApp
    const { multiWhatsAppService } = await import('../integrations/multiWhatsAppService');
    const connection = multiWhatsAppService.getConnection(req.body.connection_id);
    
    if (!connection?.socket) {
      return res.status(400).json({ error: 'No active WhatsApp connection' });
    }

    const contactJid = req.body.contact_jid || `${req.body.contact_phone}@s.whatsapp.net`;
    const sentMessage = await connection.socket.sendMessage(contactJid, { text: reply_text });

    // 2. Guardar mensaje saliente
    const { data: outMessage } = await supabase
      .from('messages')
      .insert({
        organization_id: orgId,
        conversation_id,
        contact_id,
        direction: 'outbound',
        type: 'text',
        content: reply_text,
        whatsapp_message_id: sentMessage?.key?.id,
        status: 'sent',
      })
      .select()
      .single();

    // 3. Marcar mensaje original como atendido
    await supabase
      .from('messages')
      .update({ status: 'responded_manual' })
      .eq('id', message_id);

    // 4. Registrar en consultation_metrics como pre-test
    const { data: originalMessage } = await supabase
      .from('messages')
      .select('created_at, content')
      .eq('id', message_id)
      .single();

    const startedAt = new Date(originalMessage.created_at);
    const endedAt = new Date();
    const durationSec = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

    await supabase.from('consultation_metrics').insert({
      organization_id: orgId,
      conversation_id,
      contact_id,
      channel: 'whatsapp',
      condition: 'pre', // ← PRE-TEST (atención manual)
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSec,
      user_message: originalMessage.content,
      bot_response: reply_text,
      resolved_without_escalation: true, // El humano resolvió
      escalated_to_human: true, // Por definición, fue atendido por humano
      bot_enabled: false,
      is_test: false,
    });

    res.json({ success: true, message: outMessage });
  } catch (error: any) {
    console.error('[Inbox] Reply error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inbox/toggle-bot - Activar/desactivar el bot
router.post('/toggle-bot', async (req: any, res) => {
  try {
    const orgId = req.organizationId || req.user?.organization_id;
    const { enabled } = req.body;

    const { data, error } = await supabase
      .from('organizations')
      .update({ bot_enabled: enabled })
      .eq('id', orgId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, organization: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;