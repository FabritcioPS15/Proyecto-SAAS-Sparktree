import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/flows
router.get('/', async (req, res) => {
  try {
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const { data: flows } = await supabase
      .from('flows')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false });

    res.json(flows || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// POST /api/flows
router.post('/', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    // Upsert the main flow
    const { data: existing } = await supabase
      .from('flows')
      .select('id')
      .eq('organization_id', org.id)
      .limit(1)
      .single();

    let flow;
    if (existing) {
      const { data: updated } = await supabase
        .from('flows')
        .update({ nodes, edges, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      flow = updated;
    } else {
      const { data: created } = await supabase
        .from('flows')
        .insert({ organization_id: org.id, name: 'Main Flow', nodes, edges })
        .select()
        .single();
      flow = created;
    }

    res.json(flow);
  } catch (error) {
    console.error('Error saving flow:', error);
    res.status(500).json({ error: 'Failed to save flow' });
  }
});

export default router;
