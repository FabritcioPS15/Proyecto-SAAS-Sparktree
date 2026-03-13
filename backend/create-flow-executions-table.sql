-- ============================================================
-- PASO 1: Crear tabla flow_executions (flows ya existe)
-- ============================================================

-- Drop table if it exists to start fresh
DROP TABLE IF EXISTS public.flow_executions CASCADE;

-- Create flow_executions table
CREATE TABLE public.flow_executions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    flow_id uuid NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
    conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
    executed_at timestamp with time zone DEFAULT now(),
    trigger_word text,
    completed_at timestamp with time zone,
    status text DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'abandoned')),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT flow_executions_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX idx_flow_executions_flow_id ON public.flow_executions(flow_id);
CREATE INDEX idx_flow_executions_organization_id ON public.flow_executions(organization_id);
CREATE INDEX idx_flow_executions_executed_at ON public.flow_executions(executed_at);
CREATE INDEX idx_flow_executions_status ON public.flow_executions(status);

-- Enable RLS
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
