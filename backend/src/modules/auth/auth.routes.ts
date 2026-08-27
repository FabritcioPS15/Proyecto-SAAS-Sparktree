import express from 'express';
import { supabase } from '../../core/config/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  console.log('[Auth Route] Login attempt for email:', req.body?.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Buscar usuario con join a organizations
    const { data: user, error } = await supabase
      .from('users')
      .select('*, organizations(name)')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log(`[Auth] User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verificar contraseña con bcrypt
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
    } catch (err) {
      // Fallback: comparar directamente si no es hash válido
      if (user.password_hash === password) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Retornar usuario sin contraseña
    const { password_hash, ...userWithoutPassword } = user;
    const userWithFullName = {
      ...userWithoutPassword,
      full_name: user.name || user.full_name || null
    };

    res.json({
      user: userWithFullName,
      organizationId: user.organization_id
    });
  } catch (error: any) {
    console.error('[Auth Login] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  console.log('[Auth Route] Registration attempt for email:', req.body?.email);
  try {
    const { email, password, name, organizationName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear organización si se proporciona
    let organizationId = null;
    if (organizationName) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: organizationName, is_active: true })
        .select('id')
        .single();

      if (!orgError && org) {
        organizationId = org.id;
      }
    }

    // Crear usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name,
        organization_id: organizationId,
        role: organizationId ? 'admin' : 'user',
        is_active: true
      })
      .select('*, organizations(name)')
      .single();

    if (userError) {
      console.error('[Auth Register] Error creating user:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      user: {
        ...userWithoutPassword,
        full_name: user.name || user.full_name || null
      },
      organizationId: user.organization_id
    });
  } catch (error: any) {
    console.error('[Auth Register] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/admin-login (Single-click admin login para desarrollo)
router.post('/admin-login', async (req, res) => {
  console.log('[Auth Route] Admin login attempt');
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Admin quick login only in development' });
    }

    const adminEmail = 'admin@localhost';
    
    let { data: adminUser, error } = await supabase
      .from('users')
      .select('*, organizations(name)')
      .eq('email', adminEmail)
      .single();

    if (error || !adminUser) {
      const password_hash = await bcrypt.hash('admin123', 10);
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Local Development', is_active: true })
        .select('id')
        .single();

      const organizationId = orgError ? null : org?.id;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          password_hash,
          name: 'Local Admin',
          organization_id: organizationId,
          role: 'admin',
          is_active: true
        })
        .select('*, organizations(name)')
        .single();

      if (createError) {
        console.error('[Auth Admin Login] Error creating admin:', createError);
        return res.status(500).json({ error: 'Failed to create admin user' });
      }

      adminUser = newUser;
    }

    const { password_hash, ...userWithoutPassword } = adminUser;
    
    res.json({
      user: {
        ...userWithoutPassword,
        full_name: adminUser.name || adminUser.full_name || null
      },
      organizationId: adminUser.organization_id
    });
  } catch (error: any) {
    console.error('[Auth Admin Login] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/recover-password
router.post('/recover-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (error || !user) {
      // No revelar si el email existe
      return res.json({ message: 'If the email exists, a recovery link will be sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Auth Recover] Error storing reset token:', updateError);
      return res.status(500).json({ error: 'Failed to process recovery request' });
    }

    console.log(`[Auth Recover] Reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'If the email exists, a recovery link will be sent',
      devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error: any) {
    console.error('[Auth Recover] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, reset_token_expiry')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;