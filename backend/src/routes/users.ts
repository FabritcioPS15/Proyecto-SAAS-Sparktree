import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/users (WhatsApp contacts)
router.get('/', async (req, res) => {
  try {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .order('last_active_at', { ascending: false });

    res.json(contacts || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

export default router;
