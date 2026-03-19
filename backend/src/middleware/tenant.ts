import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface TenantRequest extends Request {
  organizationId?: string;
  user?: any;
}

/**
 * Middleware to resolve the current organization (tenant)
 * Priority: 
 * 1. X-Organization-ID header (for internal/dev use)
 * 2. Authenticated user's organizationId
 */
export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const headerOrgId = req.headers['x-organization-id'] as string;
    
    if (headerOrgId) {
      req.organizationId = headerOrgId;
      return next();
    }

    // Try to use organization from authenticated user
    if (req.user && req.user.organization_id) {
      req.organizationId = req.user.organization_id;
      return next();
    }

    // fallback to a default organization if none provided (for development without full auth)
    // In production, we should always have an authenticated user and their organization
    const { data: defaultOrg } = await supabase
      .from('organizations')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (defaultOrg) {
      req.organizationId = defaultOrg.id;
    } else {
      return res.status(404).json({ error: 'Organization not found. Please ensure at least one organization exists.' });
    }

    next();
  } catch (error) {
    console.error('[Tenant Middleware] Error:', error);
    next(error);
  }
};
