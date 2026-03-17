import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*, organizations(name)')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (placeholder: in production use bcrypt)
    // Note: If the user hasn't run the migration yet, password_hash might not exist
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      organizationId: user.organization_id
    });
  } catch (error: any) {
    console.error('[Auth Login] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Since we rely on frontend session management for now, just return success
  res.json({ success: true });
});

export default router;
