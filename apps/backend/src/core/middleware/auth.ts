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
 * Basic authentication middleware.
 * Resolves user from x-user-id header and populates req.user
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      // For now, if no userId, we might want to return 401
      // but to maintain compatibility with existing flow, let's just proceed
      // and let the route handle missing user if needed.
      return next();
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (user && !error) {
      (req as any).user = user;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    next();
  }
};
