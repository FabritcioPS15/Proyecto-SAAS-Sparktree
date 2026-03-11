import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

import { qrService } from './services/whatsappQRService';

async function testBaileysSend() {
  console.log('[Test] Init QR Service...');
  // Note: For this to work, the user must be logged in via QR. 
  // We'll just try to send a simple message to the number 12345678 to see the error.
  try {
    const res = await qrService.sendTextMessage('51970477137', 'hola test directo');
    console.log('[Test] Result:', res);
  } catch (err) {
    console.error('[Test] Baileys send error:', err);
  }
}

testBaileysSend();
