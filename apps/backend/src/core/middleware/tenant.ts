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

    // Enforce strict multi-tenancy: No default organization fallback
    return res.status(401).json({ error: 'Tenant isolation violation: organizationId is required. Please provide X-Organization-ID header or authenticate properly.' });

    next();
  } catch (error) {
    console.error('[Tenant Middleware] Error:', error);
    next(error);
  }
};
