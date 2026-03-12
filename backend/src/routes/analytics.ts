import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    // 1. Get daily analytics
    const { data: dailyStats, error: dailyError } = await supabase
      .from('analytics')
      .select('*')
      .order('date', { ascending: true })
      .limit(30);

    if (dailyError) throw dailyError;

    // 2. Get total counts
    const [
      { count: totalUsers },
      { count: totalConversations },
      { count: totalMessages }
    ] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);

    // 3. Map interactions and active users charts
    const interactionsPerDay = (dailyStats || []).map(d => ({
      date: d.date,
      value: d.messages_received + d.messages_sent
    }));

    const activeUsersPerDay = (dailyStats || []).map(d => ({
      date: d.date,
      value: d.active_conversations
    }));

    // 4. Structure response
    const response = {
      interactionsPerDay,
      topFlows: [], // Can be implemented if needed by tracking flow executions
      activeUsers: activeUsersPerDay,
      stats: {
        avgResponseTime: 1.2, // Placeholder or calculate from messages diff
        satisfactionRate: 94,
        completionRate: 87,
        totalUsers: totalUsers || 0,
        totalMessages: totalMessages || 0,
        totalConversations: totalConversations || 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /api/analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
