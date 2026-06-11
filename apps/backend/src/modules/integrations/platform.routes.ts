import { Router, Response } from 'express';
import { multiPlatformService } from './platform/multiPlatformService';
import { supabase } from '../../core/config/supabase';
import { tenantMiddleware, TenantRequest } from '../../core/middleware/tenant';

const router = Router();

// GET /api/platform/connections
router.get('/connections', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(400).json({ error: 'Organization ID required. Add X-Organization-ID header.' });

    const { data: connections, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('organization_id', orgId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get detailed status for each connection
    const connectionsWithStatus = await Promise.all(
      (connections || []).map(async (conn) => {
        try {
          const status = await multiPlatformService.getConnectionStatus(conn.id);
          return status;
        } catch (err) {
          return {
            id: conn.id,
            platformType: conn.platform_type,
            status: conn.status,
            displayName: conn.display_name,
            error: 'Failed to get detailed status'
          };
        }
      })
    );

    res.json(connectionsWithStatus);
  } catch (error: any) {
    console.error('Error in /platform/connections:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/platform/connections/:id
router.get('/connections/:id', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.organizationId;
    
    if (!orgId) return res.status(400).json({ error: 'Organization ID required. Add X-Organization-ID header.' });

    const { data: connection, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error || !connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const status = await multiPlatformService.getConnectionStatus(id as string);
    res.json(status);
  } catch (error: any) {
    console.error('Error in /platform/connections/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/platform/connections
router.post('/connections', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const userId = Array.isArray(req.headers['x-user-id']) ? req.headers['x-user-id'][0] : req.headers['x-user-id'] as string;
    const { platformType, displayName, config } = req.body;

    if (!orgId) return res.status(400).json({ error: 'Organization ID required. Add X-Organization-ID header.' });
    if (!userId) return res.status(400).json({ error: 'User ID required. Add X-User-ID header.' });
    if (!platformType) return res.status(400).json({ error: 'Platform type required' });
    if (!displayName) return res.status(400).json({ error: 'Display name required' });
    if (!config) return res.status(400).json({ error: 'Config required' });

    // Validate platform type
    const validPlatforms = ['telegram', 'instagram', 'tiktok', 'facebook_messenger', 'mercadolibre'];
    if (!validPlatforms.includes(platformType)) {
      return res.status(400).json({ error: `Invalid platform type. Must be one of: ${validPlatforms.join(', ')}` });
    }

    // Validate config based on platform type
    if (platformType === 'telegram') {
      if (!config.bot_token || !config.bot_username) {
        return res.status(400).json({ error: 'Telegram requires bot_token and bot_username' });
      }
    } else if (platformType === 'instagram') {
      if (!config.instagram_business_account_id || !config.facebook_page_id || !config.access_token) {
        return res.status(400).json({ error: 'Instagram requires instagram_business_account_id, facebook_page_id, and access_token' });
      }
    } else if (platformType === 'tiktok') {
      if (!config.access_token) {
        return res.status(400).json({ error: 'TikTok requires access_token' });
      }
    } else if (platformType === 'facebook_messenger') {
      if (!config.page_id || !config.page_access_token || !config.app_id || !config.app_secret) {
        return res.status(400).json({ error: 'Facebook Messenger requires page_id, page_access_token, app_id, and app_secret' });
      }
    } else if (platformType === 'mercadolibre') {
      if (!config.seller_id || !config.access_token || !config.app_id || !config.app_secret) {
        return res.status(400).json({ error: 'Mercado Libre requires seller_id, access_token, app_id, and app_secret' });
      }
    }

    const connection = await multiPlatformService.createConnection(userId, platformType, displayName, config);
    res.json({ message: 'Platform connection created', connection });
  } catch (error: any) {
    console.error('Error in /platform/connections POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/platform/connections/:id/start
router.post('/connections/:id/start', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.organizationId;
    
    if (!orgId) return res.status(400).json({ error: 'Organization ID required. Add X-Organization-ID header.' });

    // Verify connection belongs to organization
    const { data: connection, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error || !connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await multiPlatformService.startConnection(id as string);
    res.json({ message: 'Platform connection started' });
  } catch (error: any) {
    console.error('Error in /platform/connections/:id/start:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/platform/connections/:id/delete
router.post('/connections/:id/delete', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.organizationId;
    const userId = Array.isArray(req.headers['x-user-id']) ? req.headers['x-user-id'][0] : req.headers['x-user-id'] as string;
    
    if (!orgId) return res.status(400).json({ error: 'Organization ID required. Add X-Organization-ID header.' });
    if (!userId) return res.status(400).json({ error: 'User ID required. Add X-User-ID header.' });

    // Verify connection belongs to organization
    const { data: connection, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error || !connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await multiPlatformService.deleteConnection(id as string, userId);
    res.json({ message: 'Platform connection deleted' });
  } catch (error: any) {
    console.error('Error in /platform/connections/:id/delete:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
