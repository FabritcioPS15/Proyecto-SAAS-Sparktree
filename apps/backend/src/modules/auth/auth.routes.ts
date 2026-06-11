import express from 'express';
import { supabase } from '../../core/config/supabase';

import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

function logToDebug(msg: string) {
  fs.appendFileSync(path.join(__dirname, '../../debug_requests.log'), `[AUTH DEBUG] ${new Date().toISOString()} ${msg}\n`);
}

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('[Auth Route] Login attempt for email:', req.body?.email);
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
      logToDebug(`User lookup failed for ${email}: ${error?.message || 'NOT_FOUND'}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logToDebug(`User found: ${user.email}. Hash: ${user.password_hash}`);

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      logToDebug(`Bcrypt check FAILED for ${email}. Comparing with raw password...`);
      // Fallback for simple dev passwords if not a hash
      if (user.password_hash === password) {
        logToDebug(`Literal match found for ${email}. Proceeding...`);
        // Allow it for now if they didn't run the migration correctly with hashes
      } else {
        logToDebug(`Literal match also FAILED for ${email}. Access denied.`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      logToDebug(`Bcrypt check SUCCESS for ${email}.`);
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
