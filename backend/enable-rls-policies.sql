-- ============================================================
-- Enable RLS Policies for Sparktree SaaS
-- Copy and paste this in Supabase SQL Editor
-- ============================================================

-- 1. ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.organizations
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.users
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. CONTACTS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. CONVERSATIONS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.conversations
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.messages
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. FLOWS
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.flows
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. ANALYTICS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.analytics
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Verification Queries
-- ============================================================

-- Test RLS is working
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'users', 'contacts', 'conversations', 'messages', 'flows', 'analytics')
ORDER BY tablename;
