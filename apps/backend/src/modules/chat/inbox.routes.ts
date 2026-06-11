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

    // Get total conversations
    const { data: totalConversations, error: totalError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId);

    // Get open conversations
    const { data: openConversations, error: openError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'open');

    // Get assigned conversations
    const { data: assignedConversations, error: assignedError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .not('assigned_to', 'is', null);

    // Get unassigned conversations
    const { data: unassignedConversations, error: unassignedError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .is('assigned_to', null);

    // Get conversations by platform
    const { data: platformStats, error: platformError } = await supabase
      .from('conversations')
      .select('platform_type')
      .eq('organization_id', orgId);

    // Get conversations by priority
    const { data: priorityStats, error: priorityError } = await supabase
      .from('conversations')
      .select('priority')
      .eq('organization_id', orgId);

    // Platform breakdown
    const platformCounts: any = {};
    if (platformStats) {
      platformStats.forEach((conv: any) => {
        platformCounts[conv.platform_type] = (platformCounts[conv.platform_type] || 0) + 1;
      });
    }

    // Priority breakdown
    const priorityCounts: any = {};
    if (priorityStats) {
      priorityStats.forEach((conv: any) => {
        priorityCounts[conv.priority] = (priorityCounts[conv.priority] || 0) + 1;
      });
    }

    res.json({
      total: totalConversations?.length || 0,
      open: openConversations?.length || 0,
      assigned: assignedConversations?.length || 0,
      unassigned: unassignedConversations?.length || 0,
      byPlatform: platformCounts,
      byPriority: priorityCounts
    });
  } catch (error: any) {
    console.error('Error in /inbox/stats:', error);
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

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    // Get internal notes
    const { data: notes, error: notesError } = await supabase
      .from('internal_notes')
      .select(`
        *,
        users(name, email, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (notesError) throw notesError;

    res.json({
      conversation,
      messages: messages || [],
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
