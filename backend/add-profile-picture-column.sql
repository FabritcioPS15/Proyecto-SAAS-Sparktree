-- ============================================================
-- Add profile_picture column to contacts table
-- Copy and paste this in Supabase SQL Editor
-- ============================================================

-- Add profile_picture column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contacts' 
  AND table_schema = 'public'
  AND column_name = 'profile_picture';
