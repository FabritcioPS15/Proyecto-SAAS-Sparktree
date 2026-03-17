import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const orgId = (req as any).organizationId;
        if (!orgId) return res.status(404).json({ error: 'Organization not found' });

        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('organization_id', orgId)
            .order('last_active_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }

        res.json(data);
    } catch (err) {
        console.error('Detailed Error:', err);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

export default router;
