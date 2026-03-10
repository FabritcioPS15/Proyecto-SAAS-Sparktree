import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/flows
router.get('/', async (req, res) => {
  try {
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const { data: flows, error } = await supabase
      .from('flows')
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flows:', error);
      return res.status(500).json({ error: 'Failed to fetch flows' });
    }

    // Transform the data to match frontend interface
    const transformedFlows = flows?.map(flow => ({
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar'
    })) || [];

    res.json(transformedFlows);
  } catch (error) {
    console.error('Error in GET /flows:', error);
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// GET /api/flows/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const { data: flow, error } = await supabase
      .from('flows')
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .eq('id', id)
      .eq('organization_id', org.id)
      .single();

    if (error || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Transform the data to match frontend interface
    const transformedFlow = {
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in GET /flows/:id:', error);
    res.status(500).json({ error: 'Failed to fetch flow' });
  }
});

// POST /api/flows
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description = '', 
      status = 'draft', 
      version = '1.0.0', 
      category = 'other', 
      triggers = [], 
      assigned_to = null, 
      is_default = false, 
      metrics = { conversations: 0, completionRate: 0, avgResponseTime: 0, satisfaction: 0 },
      nodes = [], 
      edges = [] 
    } = req.body;

    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const { data: flow, error } = await supabase
      .from('flows')
      .insert({
        organization_id: org.id,
        name,
        description,
        status,
        version,
        category,
        triggers,
        assigned_to,
        is_default,
        metrics,
        nodes,
        edges
      })
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating flow:', error);
      return res.status(500).json({ error: 'Failed to create flow' });
    }

    // Transform the data to match frontend interface
    const transformedFlow = {
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar'
    };

    res.status(201).json(transformedFlow);
  } catch (error) {
    console.error('Error in POST /flows:', error);
    res.status(500).json({ error: 'Failed to create flow' });
  }
});

// PUT /api/flows/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      status, 
      version, 
      category, 
      triggers, 
      assigned_to, 
      is_default, 
      metrics, 
      nodes, 
      edges 
    } = req.body;

    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const { data: flow, error } = await supabase
      .from('flows')
      .update({
        name,
        description,
        status,
        version,
        category,
        triggers,
        assigned_to,
        is_default,
        metrics,
        nodes,
        edges,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', org.id)
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .single();

    if (error || !flow) {
      console.error('Error updating flow:', error);
      return res.status(404).json({ error: 'Flow not found or update failed' });
    }

    // Transform the data to match frontend interface
    const transformedFlow = {
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in PUT /flows/:id:', error);
    res.status(500).json({ error: 'Failed to update flow' });
  }
});

// DELETE /api/flows/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', id)
      .eq('organization_id', org.id);

    if (error) {
      console.error('Error deleting flow:', error);
      return res.status(500).json({ error: 'Failed to delete flow' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /flows/:id:', error);
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

// POST /api/flows/:id/duplicate
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    // Get the original flow
    const { data: originalFlow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', org.id)
      .single();

    if (fetchError || !originalFlow) {
      return res.status(404).json({ error: 'Original flow not found' });
    }

    // Create duplicate
    const { data: newFlow, error: duplicateError } = await supabase
      .from('flows')
      .insert({
        organization_id: org.id,
        name: `${originalFlow.name} (Copia)`,
        description: originalFlow.description,
        status: 'draft',
        version: '1.0.0',
        category: originalFlow.category,
        triggers: originalFlow.triggers,
        assigned_to: originalFlow.assigned_to,
        is_default: false,
        metrics: { conversations: 0, completionRate: 0, avgResponseTime: 0, satisfaction: 0 },
        nodes: originalFlow.nodes,
        edges: originalFlow.edges
      })
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .single();

    if (duplicateError) {
      console.error('Error duplicating flow:', duplicateError);
      return res.status(500).json({ error: 'Failed to duplicate flow' });
    }

    // Transform the data to match frontend interface
    const transformedFlow = {
      ...newFlow,
      lastModified: newFlow.updated_at,
      assignedTo: newFlow.assigned_to?.name || 'Sin asignar'
    };

    res.status(201).json(transformedFlow);
  } catch (error) {
    console.error('Error in POST /flows/:id/duplicate:', error);
    res.status(500).json({ error: 'Failed to duplicate flow' });
  }
});

export default router;
