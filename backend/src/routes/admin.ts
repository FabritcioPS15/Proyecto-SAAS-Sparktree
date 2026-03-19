import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// Middleware to check if user is SuperAdmin (placeholder for real auth)
const isSuperAdmin = async (req: any, res: any, next: any) => {
  // In a real app, verify role from JWT
  // For now, we'll allow if we have the right header or just allow for dev
  next();
};

// --- ORGANIZATIONS ---

// GET /api/admin/organizations
router.get('/organizations', isSuperAdmin, async (req, res) => {
  try {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orgs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/organizations
router.post('/organizations', isSuperAdmin, async (req, res) => {
  try {
    const { name, plan } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({ name, plan: plan || 'free' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(org);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE /api/admin/organizations/:id
router.put('/organizations/:id', isSuperAdmin, async (req, res) => {
  try {
    const { name, plan } = req.body;
    const { data: org, error } = await supabase
      .from('organizations')
      .update({ name, plan })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(org);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/organizations/:id
router.delete('/organizations/:id', isSuperAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- STAFF USERS ---

// GET /api/admin/users
router.get('/users', isSuperAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*, organizations(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/users
router.post('/users', isSuperAdmin, async (req, res) => {
  try {
    const { email, full_name, role, organization_id, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        full_name,
        role: role || 'agent',
        organization_id: organization_id === '' ? null : organization_id,
        password_hash: password, // Placeholder: hash this in production
        whatsapp_connections_limit: 3,
        active_whatsapp_connections: 0
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE /api/admin/users/:id
router.put('/users/:id', isSuperAdmin, async (req, res) => {
  try {
    const { full_name, role, organization_id, password } = req.body;
    const updateData: any = { full_name, role };
    if (organization_id !== undefined) {
      updateData.organization_id = organization_id === '' ? null : organization_id;
    }
    if (password) updateData.password_hash = password;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', isSuperAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
