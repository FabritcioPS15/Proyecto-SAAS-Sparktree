import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkMultiTenantSetup() {
  console.log('--- ORGANIZATIONS ---');
  const { data: orgs, error: orgsError } = await supabase.from('organizations').select('*');
  if (orgsError) console.error('Error fetching orgs:', orgsError.message);
  else console.table(orgs.map(o => ({ id: o.id, name: o.name })));

  console.log('\n--- USERS ---');
  const { data: users, error: usersError } = await supabase.from('users').select('id, email, organization_id');
  if (usersError) console.error('Error fetching users:', usersError.message);
  else console.table(users);

  console.log('\n--- WHATSAPP CONNECTIONS ---');
  const { data: conns, error: connsError } = await supabase.from('whatsapp_connections').select('*');
  if (connsError) console.error('Error fetching connections (it might not exist yet):', connsError.message);
  else console.table(conns.map(c => ({ id: c.id, org_id: c.organization_id, status: c.status })));
}

checkMultiTenantSetup();
