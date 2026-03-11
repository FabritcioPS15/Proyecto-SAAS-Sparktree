import express from 'express';
import { qrService } from '../services/whatsappQRService';

const router = express.Router();

// GET /api/qr/status
router.get('/status', (req, res) => {
  res.json({
    status: qrService.getStatus(),
    qr: qrService.getQR()
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
