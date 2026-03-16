// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    global_role: string;
    company_role?: string;
    organization_id?: string;
  };
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Por ahora, simulamos autenticación básica
    // En producción, aquí iría la verificación real del token
    if (token === 'super-admin-token') {
      req.user = {
        id: 'super-admin-id',
        email: 'admin@saas.com',
        global_role: 'super_admin'
      };
    } else if (token === 'company-admin-token') {
      req.user = {
        id: 'company-admin-id',
        email: 'company@admin.com',
        global_role: 'user',
        company_role: 'admin',
        organization_id: '00000000-0000-0000-0000-000000000001'
      };
    } else if (token === 'user-token') {
      req.user = {
        id: 'user-id',
        email: 'user@company.com',
        global_role: 'user',
        company_role: 'member',
        organization_id: '00000000-0000-0000-0000-000000000001'
      };
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
