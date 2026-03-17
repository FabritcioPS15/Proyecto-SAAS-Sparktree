import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function checkSchema() {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  console.log('--- USERS TABLE DETAILS ---');
  const { data: userCols, error: userColError } = await supabase.rpc('get_table_columns_v2', { t_name: 'users' });
  if (userColError) {
    // Fallback: try to select one row even if it's empty by checking a known table
    const { data: sample, error: sampleError } = await supabase.from('users').select('*').limit(1);
    console.log('User sample columns:', sample && sample.length > 0 ? Object.keys(sample[0]) : 'Still empty');
  } else {
    console.log(userCols);
  }

  // Also check public.users vs others
  const { data: tables, error: tableError } = await supabase.from('organizations').select('id').limit(1);
  console.log('Organizations table exists:', !!tables);
}

checkSchema();
