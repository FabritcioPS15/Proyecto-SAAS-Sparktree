-- ============================================================
-- UPDATE flows table to support all frontend fields
-- ============================================================

-- First, let's add the missing columns to the flows table
ALTER TABLE flows 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other' CHECK (category IN ('sales', 'support', 'marketing', 'onboarding', 'other')),
ADD COLUMN IF NOT EXISTS triggers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{"conversations": 0, "completionRate": 0, "avgResponseTime": 0, "satisfaction": 0}'::jsonb;

-- Update existing flows to have default values
UPDATE flows 
SET 
  description = CASE WHEN description IS NULL OR description = '' THEN 'Flujo de automatización de WhatsApp' ELSE description END,
  status = CASE WHEN status IS NULL THEN 'draft' END,
  version = CASE WHEN version IS NULL THEN '1.0.0' END,
  category = CASE WHEN category IS NULL THEN 'other' END,
  triggers = CASE WHEN triggers IS NULL THEN '[]'::jsonb END,
  is_default = CASE WHEN is_default IS NULL THEN false END,
  metrics = CASE WHEN metrics IS NULL THEN '{"conversations": 0, "completionRate": 0, "avgResponseTime": 0, "satisfaction": 0}'::jsonb END
WHERE description IS NULL OR status IS NULL OR version IS NULL OR category IS NULL OR triggers IS NULL OR is_default IS NULL OR metrics IS NULL;

-- Create some sample flows for testing
INSERT INTO flows (organization_id, name, description, status, version, category, triggers, assigned_to, is_default, metrics, nodes, edges) VALUES
('00000000-0000-0000-0000-000000000001', 'Bot de Ventas', 'Flujo principal para calificación y cierre de ventas', 'active', '2.1.0', 'sales', '["hola", "precio", "información", "comprar"]'::jsonb, NULL, true, '{"conversations": 245, "completionRate": 87, "avgResponseTime": 1.2, "satisfaction": 4.5}'::jsonb, '[]'::jsonb, '[]'::jsonb),
('00000000-0000-0000-0000-000000000001', 'Soporte Técnico', 'Asistencia técnica y resolución de problemas', 'active', '1.8.3', 'support', '["ayuda", "problema", "soporte", "error"]'::jsonb, NULL, false, '{"conversations": 189, "completionRate": 92, "avgResponseTime": 0.8, "satisfaction": 4.7}'::jsonb, '[]'::jsonb, '[]'::jsonb),
('00000000-0000-0000-0000-000000000001', 'Marketing Campaign', 'Campaña de marketing automatizada', 'draft', '0.9.0', 'marketing', '["promo", "oferta", "descuento"]'::jsonb, NULL, false, '{"conversations": 0, "completionRate": 0, "avgResponseTime": 0, "satisfaction": 0}'::jsonb, '[]'::jsonb, '[]'::jsonb),
('00000000-0000-0000-0000-000000000001', 'Onboarding Nuevo Usuario', 'Bienvenida y configuración inicial para nuevos usuarios', 'active', '1.2.1', 'onboarding', '["nuevo", "inicio", "bienvenida", "registro"]'::jsonb, NULL, false, '{"conversations": 156, "completionRate": 95, "avgResponseTime": 0.5, "satisfaction": 4.8}'::jsonb, '[]'::jsonb, '[]'::jsonb),
('00000000-0000-0000-0000-000000000001', 'Bot Inactivo', 'Flujo en pausa para revisión', 'inactive', '1.0.0', 'other', '["test", "prueba"]'::jsonb, NULL, false, '{"conversations": 23, "completionRate": 65, "avgResponseTime": 2.1, "satisfaction": 3.2}'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT DO NOTHING;
