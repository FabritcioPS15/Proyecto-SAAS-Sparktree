-- Crear tabla de números WhatsApp si no existe
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    display_name TEXT NOT NULL,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
    webhook_url TEXT,
    qr_code TEXT,
    session_data JSONB,
    last_connected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    assigned_users UUID[] DEFAULT '{}',
    default_user UUID REFERENCES users(id),
    
    -- Restricciones únicas
    UNIQUE(organization_id, phone_number),
    
    -- Índices
    INDEX idx_whatsapp_numbers_org_id (organization_id),
    INDEX idx_whatsapp_numbers_status (status),
    INDEX idx_whatsapp_numbers_phone (phone_number),
    INDEX idx_whatsapp_numbers_active (is_active),
    INDEX idx_whatsapp_numbers_assigned_users (assigned_users) USING GIN
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_numbers_updated_at 
    BEFORE UPDATE ON whatsapp_numbers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos datos de prueba
INSERT INTO whatsapp_numbers (id, organization_id, phone_number, display_name, status, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '+1234567890', 'Número Principal', 'connected', 'super-admin-id'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '+0987654321', 'Número Secundario', 'disconnected', 'super-admin-id'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '+1122334455', 'Número Soporte', 'connecting', 'super-admin-id')
ON CONFLICT (id) DO NOTHING;
