# 🏢 Multi-Empresa WhatsApp SaaS - Guía de Implementación

## 📋 SQL para Supabase

```sql
-- Agregar columnas a la tabla flows para configuración del bot
ALTER TABLE flows 
ADD COLUMN bot_mode TEXT DEFAULT 'general_response',
ADD COLUMN fallback_message TEXT DEFAULT 'Lo siento, no entiendo tu mensaje. ¿En qué puedo ayudarte?';

-- Opcional: Crear índices para mejor rendimiento
CREATE INDEX idx_flows_bot_mode ON flows(bot_mode);
CREATE INDEX idx_flows_fallback_message ON flows(fallback_message);

-- Multi-tenant: Asegurar que flows tiene organization_id (debería existir)
-- ALTER TABLE flows ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- WhatsApp Numbers por organización
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
    webhook_url TEXT,
    access_token TEXT,
    phone_id TEXT,
    webhook_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_numbers_org_id ON whatsapp_numbers(organization_id);
CREATE INDEX idx_whatsapp_numbers_phone ON whatsapp_numbers(phone_number);

-- Conversaciones por organización y número
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS whatsapp_number_id UUID REFERENCES whatsapp_numbers(id);
CREATE INDEX idx_conversations_whatsapp_number ON conversations(whatsapp_number_id);

-- Usuarios por organización con roles
CREATE TABLE IF NOT EXISTS user_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON user_organizations(organization_id);
```

## 🔐 Mejoras de Seguridad Multi-Tenant

### 1. Middleware de Autenticación
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    organization_id: string;
    role: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verificar token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Obtener organización del usuario
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select(`
        organization_id,
        role,
        organizations(id, name)
      `)
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return res.status(403).json({ error: 'User not associated with any organization' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      organization_id: userOrg.organization_id,
      role: userOrg.role
    };

    req.organization = userOrg.organizations;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

### 2. Aplicar Middleware a Rutas
```typescript
// api/[...routes].ts
import { authenticateUser } from '../middleware/auth';

// Aplicar a todas las rutas de flows
app.use('/api/flows', authenticateUser, flowsRoutes);
```

## 📱 Múltiples Números WhatsApp

### Frontend: Selector de Números
```typescript
// components/WhatsAppNumberSelector.tsx
import React, { useState, useEffect } from 'react';

interface WhatsAppNumber {
  id: string;
  phone_number: string;
  display_name: string;
  status: 'connected' | 'disconnected' | 'error';
}

export const WhatsAppNumberSelector = () => {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');

  useEffect(() => {
    fetchWhatsAppNumbers();
  }, []);

  const fetchWhatsAppNumbers = async () => {
    try {
      const response = await api.get('/whatsapp-numbers');
      setNumbers(response.data);
    } catch (error) {
      console.error('Error fetching WhatsApp numbers:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedNumber}
        onChange={(e) => setSelectedNumber(e.target.value)}
        className="px-3 py-2 border rounded-lg"
      >
        <option value="">Seleccionar número</option>
        {numbers.map((number) => (
          <option key={number.id} value={number.id}>
            {number.display_name} ({number.phone_number}) - {number.status}
          </option>
        ))}
      </select>
      <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
        Conectar Nuevo
      </button>
    </div>
  );
};
```

### Backend: Gestión de Números
```typescript
// routes/whatsappNumbers.ts
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { data: numbers, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('organization_id', req.user?.organization_id)
      .eq('is_active', true);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch numbers' });
    }

    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { phone_number, display_name } = req.body;

    const { data: number, error } = await supabase
      .from('whatsapp_numbers')
      .insert({
        organization_id: req.user?.organization_id,
        phone_number,
        display_name,
        status: 'disconnected'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create number' });
    }

    res.status(201).json(number);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

## 🎯 Flujo Multi-Empresa Completo

### 1. Registro de Empresa
```typescript
// POST /api/organizations
{
  "name": "Empresa ABC",
  "email": "contacto@empresaabc.com",
  "phone": "+1234567890",
  "industry": "retail",
  "plan": "pro"
}
```

### 2. Invitación de Usuarios
```typescript
// POST /api/organizations/:orgId/invite
{
  "email": "usuario@empresaabc.com",
  "role": "admin"
}
```

### 3. Configuración WhatsApp
```typescript
// POST /api/whatsapp-numbers
{
  "phone_number": "+1234567890",
  "display_name": "Soporte Empresa ABC"
}
```

### 4. Creación de Flows por Empresa
```typescript
// POST /api/flows (con header X-Organization-ID)
{
  "name": "Flow Bienvenida",
  "botMode": "triggers_only",
  "fallbackMessage": "Lo siento, no entiendo. ¿En qué puedo ayudarte?",
  "triggers": ["hola", "ayuda"]
}
```

## 🔧 Configuración Frontend

### Contexto Multi-Tenant
```typescript
// contexts/TenantContext.tsx
interface TenantContextType {
  organization: Organization | null;
  user: User | null;
  whatsappNumbers: WhatsAppNumber[];
  selectedNumber: WhatsAppNumber | null;
  switchOrganization: (orgId: string) => void;
  switchWhatsAppNumber: (numberId: string) => void;
}

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  // Implementación del contexto...
};
```

### Headers en API Calls
```typescript
// services/api.ts
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Organization-ID': getCurrentOrganizationId(), // Del contexto
  },
});
```

## 🚀 Beneficios del Multi-Tenant

### ✅ Ventajas:
- **Aislamiento completo** de datos por empresa
- **Múltiples números WhatsApp** por empresa
- **Roles y permisos** granulares
- **Escalabilidad** horizontal
- **Facturación** por organización

### 📈 Monetización:
- **Plan por organización**
- **Cargo por número WhatsApp**
- **Límite de conversaciones**
- **Features por nivel** (basic, pro, enterprise)

---

## 🎯 Próximos Pasos

1. **Ejecutar SQL** en Supabase
2. **Implementar middleware** de autenticación
3. **Crear UI** para gestión multi-empresa
4. **Probar aislamiento** de datos
5. **Implementar facturación** por organización

¿Quieres que implemente alguna parte específica? 🤔
