// routes/whatsappNumbers.ts
import express from 'express';
import { supabase } from '../config/supabase';
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateUser);

// Obtener números WhatsApp del usuario
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    let query;

    if (user.global_role === 'super_admin') {
      // Super admin ve todos los números
      query = supabase
        .from('whatsapp_numbers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    } else {
      // Admin y usuarios ven números de su organización
      query = supabase
        .from('whatsapp_numbers')
        .select('*')
        .eq('organization_id', user.organization_id!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    }

    const { data: numbers, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch WhatsApp numbers' });
    }

    res.json(numbers || []);
  } catch (error) {
    console.error('Error fetching WhatsApp numbers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Obtener números por organización (para Super Admin)
router.get('/organization/:orgId', async (req: AuthenticatedRequest, res) => {
  try {
    const { orgId } = req.params;
    const user = req.user!;

    // Solo Super Admin puede ver números de otras organizaciones
    if (user.global_role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin required' });
    }

    const { data: numbers, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch organization WhatsApp numbers' });
    }

    res.json(numbers || []);
  } catch (error) {
    console.error('Error fetching organization WhatsApp numbers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Crear nuevo número WhatsApp
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { phone_number, display_name, organization_id } = req.body;

    // Validar que el usuario pueda crear números
    if (user.global_role !== 'super_admin' && user.company_role !== 'admin') {
      return res.status(403).json({ error: 'Admin required' });
    }

    // Determinar organización_id
    const targetOrgId = user.global_role === 'super_admin' 
      ? organization_id || user.organization_id
      : user.organization_id;

    // Verificar que el número no exista
    const { data: existing } = await supabase
      .from('whatsapp_numbers')
      .select('id')
      .eq('phone_number', phone_number)
      .eq('organization_id', targetOrgId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    // Crear el número
    const { data: newNumber, error } = await supabase
      .from('whatsapp_numbers')
      .insert({
        organization_id: targetOrgId,
        phone_number,
        display_name: display_name || phone_number,
        status: 'disconnected',
        assigned_users: [],
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create WhatsApp number' });
    }

    res.status(201).json(newNumber);
  } catch (error) {
    console.error('Error creating WhatsApp number:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Actualizar número WhatsApp
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const updates = req.body;

    // Obtener el número para verificar permisos
    const { data: number, error: fetchError } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !number) {
      return res.status(404).json({ error: 'WhatsApp number not found' });
    }

    // Verificar permisos
    if (user.global_role !== 'super_admin' && 
        user.organization_id !== number.organization_id &&
        !number.assigned_users.includes(user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Actualizar el número
    const { data: updatedNumber, error } = await supabase
      .from('whatsapp_numbers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update WhatsApp number' });
    }

    res.json(updatedNumber);
  } catch (error) {
    console.error('Error updating WhatsApp number:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Eliminar número WhatsApp
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Obtener el número para verificar permisos
    const { data: number, error: fetchError } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !number) {
      return res.status(404).json({ error: 'WhatsApp number not found' });
    }

    // Verificar permisos (solo admins pueden eliminar)
    if (user.global_role !== 'super_admin' && user.company_role !== 'admin') {
      return res.status(403).json({ error: 'Admin required' });
    }

    if (user.global_role !== 'super_admin' && user.organization_id !== number.organization_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete (marcar como inactivo)
    const { error } = await supabase
      .from('whatsapp_numbers')
      .update({
        is_active: false,
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete WhatsApp number' });
    }

    res.json({ message: 'WhatsApp number deleted successfully' });
  } catch (error) {
    console.error('Error deleting WhatsApp number:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Conectar número WhatsApp (simulado)
router.post('/:id/connect', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Obtener el número para verificar permisos
    const { data: number, error: fetchError } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !number) {
      return res.status(404).json({ error: 'WhatsApp number not found' });
    }

    // Verificar permisos
    if (user.global_role !== 'super_admin' && user.company_role !== 'admin') {
      return res.status(403).json({ error: 'Admin required' });
    }

    if (user.global_role !== 'super_admin' && user.organization_id !== number.organization_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Actualizar estado a conectando
    const { error: updateError } = await supabase
      .from('whatsapp_numbers')
      .update({
        status: 'connecting',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update number status' });
    }

    // Simular conexión exitosa después de 3 segundos
    setTimeout(async () => {
      await supabase
        .from('whatsapp_numbers')
        .update({
          status: 'connected',
          last_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }, 3000);

    res.json({ message: 'Connection initiated', status: 'connecting' });
  } catch (error) {
    console.error('Error connecting WhatsApp number:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Desconectar número WhatsApp
router.post('/:id/disconnect', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Obtener el número para verificar permisos
    const { data: number, error: fetchError } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !number) {
      return res.status(404).json({ error: 'WhatsApp number not found' });
    }

    // Verificar permisos
    if (user.global_role !== 'super_admin' && user.company_role !== 'admin') {
      return res.status(403).json({ error: 'Admin required' });
    }

    if (user.global_role !== 'super_admin' && user.organization_id !== number.organization_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Actualizar estado a desconectado
    const { error } = await supabase
      .from('whatsapp_numbers')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to disconnect number' });
    }

    res.json({ message: 'Number disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp number:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
