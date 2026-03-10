import express from 'express';
import Organization from '../models/Organization';

const router = express.Router();

// POST /api/settings - Guardar o actualizar la configuración
router.post('/', async (req, res) => {
  try {
    const { botName, webhookUrl, systemStatus, whatsappToken, verifyToken, phoneNumberId } = req.body;

    // En un sistema SaaS multi-tenant, buscarías por el ID de la organización del usuario autenticado
    // Por ahora, para simplificar, asumiremos una única "Organización por defecto" o buscaremos la primera
    let org = await Organization.findOne();

    if (!org) {
      // Si no existe, crearla
      org = new Organization({
        name: botName || 'Mi Bot',
        whatsappConfig: {
          phoneNumberId: phoneNumberId || '',
          accessToken: whatsappToken || '',
          verifyToken: verifyToken || ''
        },
        settings: {
          botEnabled: systemStatus === 'active'
        }
      });
    } else {
      // Si existe, actualizar
      if (botName) org.name = botName;
      if (systemStatus) {
        if (!org.settings) org.settings = { botEnabled: true, timezone: 'UTC' };
        org.settings.botEnabled = systemStatus === 'active';
      }
      
      if (!org.whatsappConfig) org.whatsappConfig = { phoneNumberId: '', accessToken: '', verifyToken: '' };
      if (phoneNumberId !== undefined) org.whatsappConfig.phoneNumberId = phoneNumberId;
      if (whatsappToken !== undefined) org.whatsappConfig.accessToken = whatsappToken;
      if (verifyToken !== undefined) org.whatsappConfig.verifyToken = verifyToken;
    }

    await org.save();
    res.status(200).json({ message: 'Settings saved successfully', organization: org });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// GET /api/settings - Obtener configuración
router.get('/', async (req, res) => {
  try {
    const org = await Organization.findOne();
    if (!org) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    // Transformamos para que encaje con el formato que espera el frontend
    res.status(200).json({
      botName: org.name,
      webhookUrl: 'https://api.midominio.com/webhook', // En la vida real puede no guardarse aquí
      systemStatus: org.settings?.botEnabled ? 'active' : 'inactive',
      whatsappToken: org.whatsappConfig?.accessToken || '',
      verifyToken: org.whatsappConfig?.verifyToken || '',
      phoneNumberId: org.whatsappConfig?.phoneNumberId || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

export default router;
