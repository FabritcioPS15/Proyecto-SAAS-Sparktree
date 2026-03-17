import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkDb() {
  console.log('--- CONTACTS ---');
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (contactsError) console.error('Error fetching contacts:', contactsError);
  else console.table(contacts?.map(c => ({ id: c.id, phone: c.phone_number, name: c.profile_name })));

  console.log('\n--- CONVERSATIONS ---');
  const { data: convs, error: convsError } = await supabase
    .from('conversations')
    .select('*, contacts(phone_number)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (convsError) console.error('Error fetching conversations:', convsError);
  else console.table(convs?.map(c => ({ 
    id: c.id, 
    contact_id: c.contact_id, 
    phone: (c.contacts as any)?.phone_number,
    status: c.status,
    last_msg: c.last_message_at
  })));
}

checkDb();
