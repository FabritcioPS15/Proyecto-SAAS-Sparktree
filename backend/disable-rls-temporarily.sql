-- ============================================================
-- Disable RLS temporarily to test connection
-- Copy and paste this in Supabase SQL Editor
-- ============================================================

-- Disable RLS on all tables
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'users', 'contacts', 'conversations', 'messages', 'flows', 'analytics')
ORDER BY tablename;
