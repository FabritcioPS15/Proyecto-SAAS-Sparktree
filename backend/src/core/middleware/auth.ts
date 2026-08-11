import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organization_id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

/**
 * Authentication + multi-tenant isolation middleware.
 *
 * Resolves the user from the X-User-ID header and enforces that the
 * requested organization (X-Organization-ID) matches the user's own
 * organization. The super_admin role is allowed to operate on any
 * organization (it manages every company).
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const requestedOrgId = req.headers['x-organization-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', hint: 'Incluye el header X-User-ID' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized', hint: 'Usuario no encontrado' });
    }

    // If an organization was explicitly requested, enforce tenant isolation
    if (requestedOrgId) {
      const isSuperAdmin = user.role === 'super_admin';
      if (!isSuperAdmin && user.organization_id !== requestedOrgId) {
        return res.status(403).json({
          error: 'Forbidden',
          hint: 'No tienes acceso a esta organización'
        });
      }
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    next(error);
  }
};
