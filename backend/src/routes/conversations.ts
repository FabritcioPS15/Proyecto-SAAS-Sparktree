import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*, contacts(phone_number, profile_name)')
      .order('last_message_at', { ascending: false });

    res.json(conversations || []);
  } catch (error) {
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

    res.json(messages || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
