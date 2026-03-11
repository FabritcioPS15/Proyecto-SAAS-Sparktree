import express from 'express';
// @ts-ignore
import QRCode from 'qrcode';
import { qrService } from '../services/whatsappQRService';

const router = express.Router();

// GET /api/qr/status
router.get('/status', async (req, res) => {
  const qrRaw = qrService.getQR();
  let qrImage = null;

  if (qrRaw) {
    try {
      qrImage = await QRCode.toDataURL(qrRaw);
    } catch (err) {
      console.error('Error generating QR image:', err);
    }
  }

  res.json({
    status: qrService.getStatus(),
    qr: qrImage
  });
});

// POST /api/qr/init
router.post('/init', async (req, res) => {
  try {
    await qrService.initialize();
    res.json({ message: 'QR Service initialized' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize QR service' });
  }
});

// POST /api/qr/update-phone
router.post('/update-phone', async (req, res) => {
  try {
    const { contactName, newPhone } = req.body;
    
    if (!contactName || !newPhone) {
      return res.status(400).json({ error: 'Se requiere contactName y newPhone' });
    }
    
    console.log(`[QR Service] Actualizando teléfono para ${contactName} a ${newPhone}`);
    
    // Usar el mismo supabase que usa el resto del sistema
    const { supabase } = require('../config/supabase');
    
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .ilike('profile_name', contactName);
    
    if (error || !contacts || contacts.length === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ phone_number: newPhone })
      .eq('id', contacts[0].id);
    
    if (updateError) {
      return res.status(500).json({ error: 'Error actualizando teléfono' });
    }
    
    res.json({ 
      success: true, 
      message: `Teléfono actualizado de ${contacts[0].phone_number} a ${newPhone}` 
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qr/test-send
router.post('/test-send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Se requiere "to" y "message"' });
    }
    
    const result = await qrService.sendTextMessage(to, message);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qr/logout
router.post('/logout', async (req, res) => {
  try {
    await qrService.logout();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;
