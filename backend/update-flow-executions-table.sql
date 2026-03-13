-- ============================================================
-- Update flow_executions table - run if table already exists
-- Copy and paste this in Supabase SQL Editor
-- ============================================================

-- Check if table exists and add missing columns/constraints
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'flow_executions' AND column_name = 'trigger_word'
    ) THEN
        ALTER TABLE public.flow_executions ADD COLUMN trigger_word text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'flow_executions' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.flow_executions ADD COLUMN completed_at timestamp with time zone;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'flow_executions' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.flow_executions ADD COLUMN status text DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'abandoned'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'flow_executions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.flow_executions ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_flow_executions_executed_at ON public.flow_executions(executed_at);
CREATE INDEX IF NOT EXISTS idx_flow_executions_status ON public.flow_executions(status);

-- Enable RLS if not enabled
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization flow executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Users can insert their organization flow executions" ON public.flow_executions;
DROP POLICY IF EXISTS "Users can update their organization flow executions" ON public.flow_executions;

-- Create RLS policies
CREATE POLICY "Users can view their organization flow executions"
    ON public.flow_executions FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization flow executions"
    ON public.flow_executions FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization flow executions"
    ON public.flow_executions FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.flow_executions TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
