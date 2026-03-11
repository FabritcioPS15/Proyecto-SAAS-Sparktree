-- ============================================================
-- Fix RLS Policies to allow SERVICE_ROLE access
-- Copy and paste this in Supabase SQL Editor
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.organizations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.conversations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.messages;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.flows;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.analytics;

-- Create new policies that allow SERVICE_ROLE and authenticated users

-- 1. ORGANIZATIONS
CREATE POLICY "Enable service role and authenticated access" ON public.organizations
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 2. USERS
CREATE POLICY "Enable service role and authenticated access" ON public.users
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. CONTACTS
CREATE POLICY "Enable service role and authenticated access" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 4. CONVERSATIONS
CREATE POLICY "Enable service role and authenticated access" ON public.conversations
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 5. MESSAGES
CREATE POLICY "Enable service role and authenticated access" ON public.messages
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 6. FLOWS
CREATE POLICY "Enable service role and authenticated access" ON public.flows
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 7. ANALYTICS
CREATE POLICY "Enable service role and authenticated access" ON public.analytics
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ============================================================
-- Alternative: Disable RLS temporarily for testing
-- ============================================================

-- If the above doesn't work, you can temporarily disable RLS:
-- ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.flows DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.analytics DISABLE ROW LEVEL SECURITY;
