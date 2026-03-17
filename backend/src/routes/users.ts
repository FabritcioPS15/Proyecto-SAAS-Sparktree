import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/users (WhatsApp contacts)
router.get('/', async (req, res) => {
  try {
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Fetch contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, phone_number, profile_name, last_active_at, created_at')
      .eq('organization_id', orgId)
      .order('last_active_at', { ascending: false });

    if (contactsError) throw contactsError;

    // Fetch message counts for all contacts in this org (ideally we should filter by org but let's assume we have a way to know the context)
    // For now, let's just get counts for these specific contacts
    const contactIds = contacts.map(c => c.id);
    
    const { data: counts, error: countsError } = await supabase
      .from('messages')
      .select('contact_id')
      .eq('organization_id', orgId)
      .in('contact_id', contactIds);

    if (countsError) throw countsError;

    // Count messages per contact
    const messageCounts = counts.reduce((acc: any, msg: any) => {
      acc[msg.contact_id] = (acc[msg.contact_id] || 0) + 1;
      return acc;
    }, {});

    // Transform to frontend format
    const transformed = contacts.map(c => ({
      id: c.id,
      phoneNumber: c.phone_number,
      name: c.profile_name || 'Usuario Anon',
      firstInteraction: c.created_at,
      lastInteraction: c.last_active_at,
      totalMessages: messageCounts[c.id] || 0
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error in /api/users:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

export default router;
