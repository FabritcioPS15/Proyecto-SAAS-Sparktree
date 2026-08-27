import { Router, Response } from 'express';
import { supabase } from '../../core/config/supabase';
import { tenantMiddleware, TenantRequest } from '../../core/middleware/tenant';

const router = Router();

// GET /api/inbox - Get unified inbox for organization
router.get('/', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const { platform, status, assignedTo, priority, department, limit = 50, offset = 0 } = req.query;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });

    let query = supabase
      .from('conversations')
      .select(`
        *,
        contacts(*),
        platform_connections!inner(platform_type, display_name),
        assigned_agent:users!conversations_assigned_to_fkey(name, email, avatar_url),
        messages(count)
      `)
      .eq('organization_id', orgId);

    // Filter by platform
    if (platform) {
      query = query.eq('platform_type', platform);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by assigned agent
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Filter by department
    if (department) {
      query = query.eq('department', department);
    }

    // Pagination
    query = query
      .order('last_message_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: conversations, error } = await query;

    if (error) throw error;

    res.json(conversations);
  } catch (error: any) {
    console.error('Error in /inbox:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inbox/stats - Get inbox statistics
router.get('/stats', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });

    // Combine all stats into two queries: count with filters, and breakdown aggregates
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('platform_type, priority, status, assigned_to')
      .eq('organization_id', orgId);

    if (convError) throw convError;

    const total = conversations?.length || 0;
    let open = 0, assigned = 0, unassigned = 0;
    const platformCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    for (const conv of conversations || []) {
      if (conv.status === 'open') open++;
      if (conv.assigned_to) assigned++;
      else unassigned++;

      if (conv.platform_type) {
        platformCounts[conv.platform_type] = (platformCounts[conv.platform_type] || 0) + 1;
      }
      if (conv.priority) {
        priorityCounts[conv.priority] = (priorityCounts[conv.priority] || 0) + 1;
      }
    }

    res.json({
      total,
      open,
      assigned,
      unassigned,
      byPlatform: platformCounts,
      byPriority: priorityCounts
    });
  } catch (error: any) {
    console.error('Error in /inbox/stats:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============================================================
// ENDPOINTS PARA MODO PRE-TEST (O₁) — Atención Manual
// ============================================================

// POST /api/inbox/toggle-bot - Activar/desactivar el bot de la organización
router.post('/toggle-bot', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const { enabled } = req.body;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled (boolean) is required' });
    }

    const { data, error } = await supabase
      .from('organizations')
      .update({ bot_enabled: enabled })
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw error;

    console.log(`[Inbox] Bot ${enabled ? 'ACTIVADO' : 'DESACTIVADO'} para org ${orgId}`);
    res.json({ success: true, bot_enabled: enabled, organization: data });
  } catch (error: any) {
    console.error('Error in /inbox/toggle-bot:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inbox/bot-status - Obtener estado actual del bot
router.get('/bot-status', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });

    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, bot_enabled')
      .eq('id', orgId)
      .single();

    if (error) throw error;
    res.json({ bot_enabled: data?.bot_enabled ?? true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inbox/manual-reply - Responder manualmente (pre-test O₁)
// Este endpoint:
//   1. Envía el mensaje por WhatsApp
//   2. Guarda el mensaje saliente en BD
//   3. Registra en consultation_metrics con condition='pre'
// POST /api/inbox/manual-reply - Responder manualmente (pre-test O₁)
router.post('/manual-reply', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const {
      conversation_id,
      contact_id,
      contact_phone,
      contact_jid,
      connection_id,
      reply_text,
      original_message_id,
    } = req.body;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });
    if (!reply_text) return res.status(400).json({ error: 'reply_text is required' });
    if (!contact_jid && !contact_phone) {
      return res.status(400).json({ error: 'contact_jid or contact_phone required' });
    }

    // 1. Obtener el socket de WhatsApp activo
    const { multiWhatsAppService } = await import('../integrations/multiWhatsAppService');
    const connId = connection_id || Array.from((multiWhatsAppService as any).connections?.keys?.() || [])[0];
    const connection = connId ? multiWhatsAppService.getConnection(connId) : null;

    if (!connection?.socket) {
      return res.status(400).json({ error: 'No active WhatsApp socket' });
    }

    const jid = contact_jid || `${contact_phone}@s.whatsapp.net`;

    // 2. Enviar respuesta por WhatsApp
    const sentMessage = await connection.socket.sendMessage(jid, { text: reply_text });
    console.log(`[Inbox] Manual reply sent to ${jid}: ${sentMessage?.key?.id}`);

    // 3. Guardar mensaje saliente en BD
    const { data: outMsg } = await supabase
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

    // 4. Obtener el mensaje original para calcular duración y extraer texto
    let startedAt: Date | null = null;
    let userMessage: string | null = null;

    if (original_message_id) {
      const { data: original } = await supabase
        .from('messages')
        .select('created_at, content')
        .eq('id', original_message_id)
        .single();

      if (original) {
        startedAt = new Date(original.created_at);
        
        // ⭐ EXTRAER TEXTO LIMPIO del JSON de Baileys
        try {
          const parsed = JSON.parse(original.content);
          userMessage = 
            parsed?.message?.conversation ||
            parsed?.message?.extendedTextMessage?.text ||
            parsed?.text?.body ||
            parsed?.body ||
            parsed?.message?.imageMessage?.caption ||
            parsed?.message?.documentMessage?.caption ||
            parsed?.message?.videoMessage?.caption ||
            original.content;
        } catch {
          userMessage = original.content;
        }
      }
    }

    const endedAt = new Date();
    const durationSec = startedAt
      ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
      : null;

    // 5. Registrar en consultation_metrics como PRE-TEST
    const { data: metric } = await supabase
      .from('consultation_metrics')
      .insert({
        organization_id: orgId,
        conversation_id,
        contact_id,
        channel: 'whatsapp',
        condition: 'pre',
        started_at: startedAt?.toISOString() || endedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSec,
        user_message: userMessage,  // ← TEXTO LIMPIO
        bot_response: reply_text,
        resolved_without_escalation: false,
        escalated_to_human: true,
        bot_enabled: false,
        is_test: false,
        source_message_id: original_message_id || outMsg?.id,
      })
      .select()
      .single();

    res.json({
      success: true,
      message: outMsg,
      metric,
      duration_seconds: durationSec,
    });
  } catch (error: any) {
    console.error('Error in /inbox/manual-reply:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inbox/:conversationId - Get conversation with messages
router.get('/:conversationId', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const { conversationId } = req.params;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });

    // Get conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        contacts(*),
        platform_connections!inner(platform_type, display_name),
        assigned_agent:users!conversations_assigned_to_fkey(name, email, avatar_url)
      `)
      .eq('id', conversationId)
      .eq('organization_id', orgId)
      .single();

    if (error || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages (last 100, newest first for pagination)
    const messageLimit = Math.min(parseInt(req.query.messageLimit as string) || 100, 500);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, created_at, direction, type, status, organization_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(messageLimit);

    if (messagesError) throw messagesError;

    // Get internal notes
    const { data: notes, error: notesError } = await supabase
      .from('internal_notes')
      .select(`
        *,
        users(name, email, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notesError) throw notesError;

    res.json({
      conversation,
      messages: (messages || []).reverse(), // chronological order
      notes: notes || []
    });
  } catch (error: any) {
    console.error('Error in /inbox/:conversationId:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inbox/:conversationId/priority - Update conversation priority
router.patch('/:conversationId/priority', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const { conversationId } = req.params;
    const { priority } = req.body;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });
    if (!priority) return res.status(400).json({ error: 'Priority required' });

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }

    // Verify conversation belongs to organization
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('organization_id', orgId)
      .single();

    if (error || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update({ priority })
      .eq('id', conversationId)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ message: 'Priority updated successfully', conversation: updatedConversation });
  } catch (error: any) {
    console.error('Error in /inbox/:conversationId/priority:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inbox/:conversationId/status - Update conversation status
router.patch('/:conversationId/status', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const { conversationId } = req.params;
    const { status } = req.body;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required' });
    if (!status) return res.status(400).json({ error: 'Status required' });

    const validStatuses = ['open', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Verify conversation belongs to organization
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('organization_id', orgId)
      .single();

    if (error || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', conversationId)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ message: 'Status updated successfully', conversation: updatedConversation });
  } catch (error: any) {
    console.error('Error in /inbox/:conversationId/status:', error);
    res.status(500).json({ error: error.message });
  }
});




export default router;
