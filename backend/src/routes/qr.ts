import { Router, Response } from 'express';
import { multiWhatsAppService } from '../services/multiWhatsAppService';
import { supabase } from '../config/supabase';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import QRCode from 'qrcode';

const router = Router();

// Helper to get primary connection for organization
async function getOrgConnection(orgId: string) {
  let connections = multiWhatsAppService.getOrganizationConnections(orgId);
  
  if (connections.length === 0) {
    // Check DB in case it wasn't initialized in memory
    const { data: dbConns } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('organization_id', orgId)
      .limit(1);
    
    if (dbConns && dbConns.length > 0) {
      await multiWhatsAppService.initializeConnection(dbConns[0]);
      return multiWhatsAppService.getConnection(dbConns[0].id);
    }
    return null;
  }
  
  return connections[0];
}

// GET /api/qr/status
router.get('/status', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(401).json({ error: 'No organization context' });

    const connection = await getOrgConnection(orgId);
    
    if (!connection) {
      return res.json({ status: 'disconnected', message: 'No connection found' });
    }

    let qrImage = null;
    if (connection.qr) {
      try {
        qrImage = await QRCode.toDataURL(connection.qr);
      } catch (err) {
        console.error('Error generating QR image:', err);
      }
    }

    res.json({
      id: connection.id,
      status: connection.status,
      qr: qrImage,
      displayName: connection.displayName,
      phoneNumber: connection.phoneNumber,
      lastConnectedAt: connection.lastConnectedAt
    });
  } catch (error: any) {
    console.error('Error in /qr/status:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qr/init
router.post('/init', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    const userId = req.headers['x-user-id'] as string;
    
    if (!orgId) return res.status(401).json({ error: 'No organization context' });

    let connection = await getOrgConnection(orgId);
    
    if (!connection) {
      if (!userId) {
        // Fallback: try to find a user in this organization
        const { data: orgUser } = await supabase
          .from('users')
          .select('id')
          .eq('organization_id', orgId)
          .limit(1)
          .single();
        
        if (!orgUser) return res.status(400).json({ error: 'UserId required and no default user found' });
        connection = await multiWhatsAppService.createConnection(orgUser.id, 'Principal');
      } else {
        connection = await multiWhatsAppService.createConnection(userId, 'Principal');
      }
    }

    if (!connection) {
      return res.status(500).json({ error: 'Failed to initialize or create connection' });
    }

    // Force start connection to get QR
    await multiWhatsAppService.startConnection(connection.id);

    res.json({ message: 'WhatsApp connection initialized', id: connection.id });
  } catch (error: any) {
    console.error('Error in /qr/init:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qr/logout
router.post('/logout', tenantMiddleware, async (req: TenantRequest, res: Response) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(401).json({ error: 'No organization context' });

    const connection = await getOrgConnection(orgId);
    
    if (connection && connection.userId) {
      await multiWhatsAppService.deleteConnection(connection.id, connection.userId);
      res.json({ message: 'Logged out and connection deleted', status: 'disconnected' });
    } else if (connection) {
      // If we don't have userId in memory but have a connection ID
      const { data: dbConn } = await supabase
        .from('whatsapp_connections')
        .select('user_id')
        .eq('id', connection.id)
        .single();
      
      if (dbConn) {
        await multiWhatsAppService.deleteConnection(connection.id, dbConn.user_id);
        return res.json({ message: 'Logged out and connection deleted', status: 'disconnected' });
      }
      res.status(400).json({ error: 'Could not find user associated with connection' });
    } else {
      res.status(404).json({ error: 'No connection found' });
    }
  } catch (error: any) {
    console.error('Error in /qr/logout:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
