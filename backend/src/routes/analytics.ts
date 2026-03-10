import express from 'express';
import Analytics from '../models/Analytics';

const router = express.Router();

// Get analytics for dashboard
router.get('/', async (req, res) => {
  try {
    const analytics = await Analytics.find().sort({ date: -1 }).limit(30);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
