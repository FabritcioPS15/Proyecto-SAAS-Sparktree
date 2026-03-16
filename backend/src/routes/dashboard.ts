// routes/dashboard.ts
import express from 'express';
import { supabase } from '../config/supabase';
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateUser);

// Dashboard para Super Admin
router.get('/super-admin/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    // El usuario ya viene del middleware, no necesitamos verificar de nuevo
    const user = req.user;
    
    if (!user || user.global_role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin required' });
    }

    // Estadísticas globales
    const { data: orgCount } = await supabase
      .from('organizations')
      .select('id', { count: 'exact' });
    
    const { data: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
    
    const { data: numberCount } = await supabase
      .from('whatsapp_numbers')
      .select('id', { count: 'exact' });
    
    const { data: convCount } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('status', 'active');
    
    // Mensajes hoy (simulado por ahora)
    const messagesToday = Math.floor(Math.random() * 1000) + 500;
    
    // Ingresos mensuales (simulado por ahora)
    const monthlyRevenue = Math.floor(Math.random() * 10000) + 5000;

    res.json({
      totalOrganizations: orgCount?.length || 0,
      totalUsers: userCount?.length || 0,
      totalNumbers: numberCount?.length || 0,
      activeConversations: convCount?.length || 0,
      messagesToday,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error in super admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Dashboard para Admin de Empresa
router.get('/company/:orgId/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    const { orgId } = req.params;
    const user = req.user;
    
    // Verificar que el usuario pertenezca a la organización y sea admin
    if (!user || user.company_role !== 'admin' || user.organization_id !== orgId) {
      return res.status(403).json({ error: 'Company admin required' });
    }

    // Estadísticas de la empresa
    const { data: userCount } = await supabase
      .from('user_organizations')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId);
    
    const { data: numberCount } = await supabase
      .from('whatsapp_numbers')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId);
    
    const { data: convCount } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'active');
    
    // Mensajes hoy (simulado por ahora)
    const messagesToday = Math.floor(Math.random() * 500) + 100;

    res.json({
      totalUsers: userCount?.length || 0,
      totalNumbers: numberCount?.length || 0,
      activeConversations: convCount?.length || 0,
      messagesToday
    });
  } catch (error) {
    console.error('Error in company dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Dashboard para Usuario Regular
router.get('/user/:userId/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    
    // Verificar que el usuario solo vea sus propios datos
    if (!user || user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Estadísticas del usuario
    const { data: convCount } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('assigned_agent', userId)
      .eq('status', 'active');
    
    // Mensajes hoy (simulado por ahora)
    const messagesToday = Math.floor(Math.random() * 100) + 20;

    res.json({
      activeConversations: convCount?.length || 0,
      messagesToday
    });
  } catch (error) {
    console.error('Error in user dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
