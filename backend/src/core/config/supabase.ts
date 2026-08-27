import { createClient } from '@supabase/supabase-js';
import { ipv4HttpsAgent, ipv4HttpAgent } from './fetch-polyfill';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

// Cliente fetch personalizado que fuerza IPv4 siempre
const customFetch = (url: any, options: any = {}) => {
  const urlString = typeof url === 'string' ? url : url.toString();
  
  return fetch(url, {
    ...options,
    agent: urlString.startsWith('https:') ? ipv4HttpsAgent : ipv4HttpAgent
  });
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch
  }
});

console.log('✅ [Supabase] Cliente inicializado con forzado IPv4');