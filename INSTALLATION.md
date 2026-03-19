# 🚀 Guía de Instalación y Configuración
# Sparktree SaaS - Sistema Multitenant de Chatbots WhatsApp

## 📋 Requisitos Previos

### Software Necesario:
- **Node.js 18+**
- **PostgreSQL 13+**
- **Git**

### Opcional (Recomendado):
- **Supabase** (para producción en la nube)
- **Docker** (para desarrollo aislado)

---

## 🗄️ Paso 1: Configurar Base de Datos

### Opción A: PostgreSQL Local (Recomendado para desarrollo)

1. **Instalar PostgreSQL:**
```bash
# Windows (usando Chocolatey)
choco install postgresql

# macOS (usando Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

2. **Crear Base de Datos:**
```bash
# Iniciar PostgreSQL
sudo service postgresql start

# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE sparktree_saas;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sparktree_saas TO your_user;
\q
```

3. **Ejecutar Script de Instalación:**
```bash
cd database
psql -U your_user -d sparktree_saas -f install_complete.sql
```

### Opción B: Supabase Cloud (Recomendado para producción)

1. **Crear cuenta en [Supabase](https://supabase.com)**
2. **Crear nuevo proyecto**
3. **Copiar URL y ANON_KEY** del proyecto
4. **Ejecutar el script SQL** en el editor SQL de Supabase

---

## 🔧 Paso 2: Configurar Backend

1. **Ir al directorio del backend:**
```bash
cd backend
```

2. **Copiar archivo de configuración:**
```bash
cp .env.example .env
```

3. **Configurar variables:**

#### Para PostgreSQL Local:
```env
# Descomentar estas líneas
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sparktree_saas
DB_USER=your_user
DB_PASSWORD=your_password

# Comentar líneas de Supabase
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
```

#### Para Supabase:
```env
# Usar configuración de Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key

# Comentar líneas de PostgreSQL local
# DB_HOST=...
```

4. **Instalar dependencias:**
```bash
npm install
```

5. **Iniciar backend:**
```bash
npm run dev
```

---

## 🎨 Paso 3: Configurar Frontend

1. **Ir al directorio del frontend:**
```bash
cd frontend
```

2. **Copiar archivo de configuración:**
```bash
cp .env.example .env
```

3. **Verificar configuración:**
```env
# Debe apuntar al backend
VITE_API_URL=http://localhost:3000/api
```

4. **Instalar dependencias:**
```bash
npm install
```

5. **Iniciar frontend:**
```bash
npm run dev
```

---

## 🎯 Paso 4: Probar el Sistema

### Acceder a la Aplicación:

1. **Frontend:** http://localhost:5173
2. **Backend API:** http://localhost:3000/api

### Usuarios de Demo:

1. **Super Administrador:**
   - Email: `admin@sparktree.io`
   - Rol: `super_admin`
   - Acceso: Completo a todas las funciones

2. **Administrador Staff:**
   - Email: `staff@sparktree.io`
   - Rol: `staff`
   - Acceso: Funciones administrativas básicas

3. **Usuario Empresa:**
   - Email: `empresa@demo.com`
   - Rol: `empresa`
   - Acceso: Limitado a 2 números WhatsApp

### Funcionalidades a Probar:

#### ✅ **Gestión de Números WhatsApp:**
1. **Iniciar sesión** como `empresa@demo.com`
2. **Ir a Settings** → "Números de WhatsApp"
3. **Verificar:**
   - Muestra solo 2 números de la empresa
   - Límite de 2 números funciona
   - Puede agregar/eliminar números

#### ✅ **Aislamiento de Datos:**
1. **Iniciar sesión** como `empresa@demo.com`
2. **Verificar que solo** ve datos de su organización
3. **Iniciar sesión** como `admin@sparktree.io`
4. **Verificar que ve** datos diferentes

#### ✅ **Límites por Rol:**
1. **Usuario empresa** no ve opciones de administración
2. **Usuario admin** ve todas las opciones
3. **Menú lateral** se adapta según rol

---

## 🔍 Paso 5: Verificación

### Comandos SQL para Verificar Datos:

```sql
-- Ver organizaciones
SELECT id, name, plan, max_whatsapp_connections FROM organizations;

-- Ver usuarios por organización
SELECT u.email, u.role, o.name as organization 
FROM users u 
JOIN organizations o ON u.organization_id = o.id;

-- Ver conexiones WhatsApp por organización
SELECT wc.display_name, wc.phone_number, wc.status, o.name as organization
FROM whatsapp_connections wc
JOIN organizations o ON wc.organization_id = o.id;

-- Verificar límite de 2 números por organización
SELECT 
  o.name as organization,
  COUNT(wc.id) as current_connections,
  o.max_whatsapp_connections as max_allowed
FROM organizations o
LEFT JOIN whatsapp_connections wc ON o.id = wc.organization_id
GROUP BY o.id, o.name, o.max_whatsapp_connections;
```

---

## 🚨 Solución de Problemas Comunes

### Error: "column max_whatsapp_connections does not exist"
**Solución:** Ejecutar el script `install_complete.sql` completamente

### Error: "invalid input syntax for type uuid"
**Solución:** Usar el script `install_complete.sql` (ya corregido)

### Error: "Connection refused"
**Solución:** Verificar que el backend esté corriendo en el puerto 3000

### Error: "CORS policy"
**Solución:** Verificar configuración de CORS en el backend

---

## 📚 Estructura del Proyecto

```
Proyecto-SAAS-Sparktree/
├── backend/                 # Servidor Node.js + Express
│   ├── .env.example        # Configuración backend
│   └── src/               # Código fuente backend
├── frontend/               # Aplicación React + TypeScript
│   ├── .env.example        # Configuración frontend
│   └── src/               # Código fuente frontend
├── database/               # Scripts SQL
│   ├── install_complete.sql # Instalación completa
│   ├── schema.sql         # Esquema de tablas
│   ├── seed_data.sql      # Datos de demo
│   └── README.md          # Documentación BD
└── docs/                  # Documentación adicional
```

---

## 🎉 ¡Listo para Usar!

Una vez completados estos pasos:

1. ✅ **Base de datos** instalada con datos de demo
2. ✅ **Backend** configurado y corriendo
3. ✅ **Frontend** configurado y corriendo
4. ✅ **Sistema multitenant** funcional
5. ✅ **Límite de 2 números** por organización activo
6. ✅ **Aislamiento de datos** verificado

¡El sistema Sparktree SaaS está completamente operativo! 🚀
