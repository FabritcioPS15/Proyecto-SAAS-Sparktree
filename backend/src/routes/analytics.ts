import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    res.json(analytics || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
