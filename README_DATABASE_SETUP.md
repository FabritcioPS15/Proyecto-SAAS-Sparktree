# Configuración de Base de Datos - Sparktree SaaS

## Pasos para configurar la base de datos y conectar el frontend

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una nueva cuenta
2. Crea un nuevo proyecto llamado "sparktree-saas"
3. Ve al editor SQL de tu proyecto Supabase

### 2. Ejecutar el Schema

Copia y pega el contenido del archivo `schema.sql` en el editor SQL de Supabase y ejecútalo.

### 3. Actualizar la tabla de Flows

Copia y pega el contenido del archivo `schema_flows_updated.sql` en el editor SQL de Supabase y ejecútalo. Esto agregará los campos necesarios para los flujos.

### 4. Configurar Variables de Entorno

#### Backend:
1. Copia `.env.example` a `.env`
2. Configura las variables de Supabase:
   ```
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_key_anonima_de_supabase
   ```

#### Frontend:
1. Copia `.env.example` a `.env`
2. Configura la URL del backend:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

### 5. Iniciar los Servicios

#### Backend:
```bash
cd backend
npm install
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 6. Verificar la Conexión

1. Abre `http://localhost:5173` en tu navegador
2. Deberías ver los flujos de ejemplo cargados desde la base de datos
3. Prueba crear, editar, duplicar y eliminar flujos

## Estructura de Datos

### Flows (Flujos)
- `id`: UUID único del flujo
- `name`: Nombre del flujo
- `description`: Descripción del flujo
- `status`: 'active' | 'inactive' | 'draft'
- `version`: Versión del flujo
- `category`: 'sales' | 'support' | 'marketing' | 'onboarding' | 'other'
- `triggers`: Array de palabras clave que activan el flujo
- `assigned_to`: ID del usuario asignado (nullable)
- `is_default`: Booleano que indica si es el flujo por defecto
- `metrics`: Métricas del flujo (conversaciones, tasa de completación, etc.)
- `nodes`: JSON con los nodos del flujo (para el flow builder)
- `edges`: JSON con las conexiones entre nodos

### Organizations (Organizaciones)
- `id`: UUID único
- `name`: Nombre de la organización
- `whatsapp_phone_number_id`: ID del número de WhatsApp
- `whatsapp_access_token`: Token de acceso a WhatsApp
- `whatsapp_verify_token`: Token de verificación de webhook
- `plan`: Plan de la organización ('free', 'pro', etc.)

## API Endpoints

### Flows:
- `GET /api/flows` - Obtener todos los flujos
- `GET /api/flows/:id` - Obtener un flujo específico
- `POST /api/flows` - Crear un nuevo flujo
- `PUT /api/flows/:id` - Actualizar un flujo
- `DELETE /api/flows/:id` - Eliminar un flujo
- `POST /api/flows/:id/duplicate` - Duplicar un flujo

## Troubleshooting

### Error: "Organization not found"
- Asegúrate de que la organización por defecto está creada en la base de datos
- El ID por defecto es: `00000000-0000-0000-0000-000000000001`

### Error: "Failed to fetch flows"
- Verifica que el backend esté corriendo en el puerto 3000
- Revisa las variables de entorno del backend
- Verifica la conexión a Supabase

### Error: "CORS"
- Asegúrate de que el frontend esté configurado para允许 solicitudes desde `http://localhost:5173`
- El backend ya tiene CORS configurado para permitir todos los orígenes

## Datos de Ejemplo

El sistema incluye datos de ejemplo pre-cargados:
- Bot de Ventas (Activo)
- Soporte Técnico (Activo)
- Marketing Campaign (Borrador)
- Onboarding Nuevo Usuario (Activo)
- Bot Inactivo (Inactivo)

Estos datos se insertan automáticamente al ejecutar el schema actualizado.
