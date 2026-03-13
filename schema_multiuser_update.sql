-- ============================================================
-- Multi-User WhatsApp QR System - Schema Updates
-- Add support for multiple WhatsApp connections per user
-- ============================================================

-- ============================================================
-- TABLE: whatsapp_connections
-- Stores individual WhatsApp QR connections per user
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT, -- The WhatsApp phone number connected
  display_name TEXT NOT NULL DEFAULT 'Mi WhatsApp',
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'error')),
  qr_code TEXT, -- Base64 QR code when connecting
  last_connected_at TIMESTAMPTZ,
  auth_state_path TEXT, -- Path to stored auth state for this connection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, display_name)
);

-- ============================================================
-- TABLE: flow_assignments
-- Assign flows to specific WhatsApp connections
-- ============================================================
CREATE TABLE IF NOT EXISTS flow_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  whatsapp_connection_id UUID REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flow_id, whatsapp_connection_id)
);

-- ============================================================
-- Add columns to flows table for better multi-user support
-- ============================================================
ALTER TABLE flows 
ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_whatsapp_connection_id UUID REFERENCES whatsapp_connections(id) ON DELETE SET NULL;

-- ============================================================
-- Add columns to users table for WhatsApp limits
-- ============================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_connections_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS active_whatsapp_connections INTEGER DEFAULT 0;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_user_id ON whatsapp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_org_id ON whatsapp_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_status ON whatsapp_connections(status);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_flow_id ON flow_assignments(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_connection_id ON flow_assignments(whatsapp_connection_id);
CREATE INDEX IF NOT EXISTS idx_flows_assigned_user ON flows(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_flows_assigned_connection ON flows(assigned_whatsapp_connection_id);

-- ============================================================
-- RLS Policies for security
-- ============================================================
-- Users can only see their own WhatsApp connections
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own whatsapp connections" ON whatsapp_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whatsapp connections" ON whatsapp_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp connections" ON whatsapp_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whatsapp connections" ON whatsapp_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Flow assignments visibility based on organization
ALTER TABLE flow_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization flow assignments" ON flow_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM flows f 
      WHERE f.id = flow_assignments.flow_id 
      AND f.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );
