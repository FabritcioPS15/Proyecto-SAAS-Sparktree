import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// POST /api/settings
router.post('/', async (req, res) => {
  try {
    const { botName, whatsappToken, verifyToken, phoneNumberId } = req.body;

    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();

    const updates: any = {};
    if (botName) updates.name = botName;
    if (phoneNumberId !== undefined) updates.whatsapp_phone_number_id = phoneNumberId;
    if (whatsappToken !== undefined) updates.whatsapp_access_token = whatsappToken;
    if (verifyToken !== undefined) updates.whatsapp_verify_token = verifyToken;

    if (org) {
      await supabase.from('organizations').update(updates).eq('id', org.id);
      res.status(200).json({ message: 'Settings saved successfully' });
    } else {
      // Create first org
      await supabase.from('organizations').insert({
        name: botName || 'My Bot',
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_access_token: whatsappToken,
        whatsapp_verify_token: verifyToken
      });
      res.status(201).json({ message: 'Organization created and settings saved' });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const { data: org } = await supabase.from('organizations').select('*').limit(1).single();
    if (!org) return res.status(404).json({ error: 'Settings not found' });

    res.status(200).json({
      botName: org.name,
      systemStatus: 'active',
      whatsappToken: org.whatsapp_access_token || '',
      verifyToken: org.whatsapp_verify_token || '',
      phoneNumberId: org.whatsapp_phone_number_id || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

export default router;
