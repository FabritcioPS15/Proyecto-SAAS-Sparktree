import express from 'express';
import Flow from '../models/Flow';
import Organization from '../models/Organization';

const router = express.Router();

// GET /api/flows - Get organization's flows
router.get('/', async (req, res) => {
  try {
    const org = await Organization.findOne();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const flows = await Flow.find({ organizationId: org._id }).sort({ createdAt: -1 });
    res.json(flows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// POST /api/flows - Create or update a single flow (Simplified for now)
router.post('/', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    
    let org = await Organization.findOne();
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    // Assuming a single main flow for now. 
    // If you want multiple flows, pass an _id in req.body and findByIdAndUpdate.
    let flow = await Flow.findOne({ organizationId: org._id });
    
    if (!flow) {
      flow = new Flow({
        organizationId: org._id,
        name: 'Main Flow',
        nodes,
        edges
      });
    } else {
      flow.nodes = nodes;
      flow.edges = edges;
    }

    await flow.save();
    res.json(flow);
  } catch (error) {
    console.error('Error saving flow:', error);
    res.status(500).json({ error: 'Failed to save flow' });
  }
});

export default router;
