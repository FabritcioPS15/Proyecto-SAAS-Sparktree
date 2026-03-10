import express from 'express';
import User from '../models/User';
import Contact from '../models/Contact';

const router = express.Router();

// Get all contacts (users)
router.get('/', async (req, res) => {
  try {
    // In a real app, filter by req.user.organizationId
    const contacts = await Contact.find().sort({ lastActiveAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  res.json({ message: "Analytics endpoint" });
});

export default router;
