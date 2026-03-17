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
    
    if (!email || !organization_id) {
      return res.status(400).json({ error: 'Email and Organization are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        full_name,
        role: role || 'user',
        organization_id,
        password_hash: password // Placeholder: hash this in production
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
