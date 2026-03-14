# 🚀 Despliegue en Vercel

## 📋 Requisitos Previos

1. **Cuenta en Vercel**: [vercel.com](https://vercel.com)
2. **Vercel CLI instalado**: `npm i -g vercel`
3. **GitHub conectado** (opcional pero recomendado)

## 🔧 Configuración Realizada

### 1. 📁 Archivos de Configuración Creados

#### Backend (`backend/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/[...routes].ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/[...routes].ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Frontend (`frontend/vite.config.ts`)
- Configurado para producción
- Build optimizado para Vercel
- Alias `@` configurado

#### Variables de Entorno
- **Producción**: `frontend/.env.production`
- **Desarrollo**: `frontend/.env.example`

## 🚀 Pasos para Desplegar

### Opción 1: Subir Todo el Proyecto

1. **Instalar Vercel CLI**:
```bash
npm install -g vercel
```

2. **Iniciar sesión en Vercel**:
```bash
vercel login
```

3. **Desde la raíz del proyecto**:
```bash
cd "c:\Users\Fabritcio Peña\OneDrive\Documentos\Proyecto-SAAS-Sparktree"
vercel --prod
```

### Opción 2: Subir por Separado

#### Backend:
```bash
cd backend
vercel --prod
```

#### Frontend:
```bash
cd frontend
vercel --prod
```

## 🔗 URLs Resultantes

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend API**: `https://tu-proyecto.vercel.app/api`

## ⚙️ Variables de Entorno en Vercel

Configura en el dashboard de Vercel:

### Backend:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`

### Frontend:
- `VITE_API_URL=https://tu-proyecto.vercel.app/api`

## 🛠️ Solución de Problemas Comunes

### CORS Issues
El backend ya está configurado para aceptar peticiones del frontend en Vercel.

### Build Errors
```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm install
```

### Timeout Errors
Los timeouts están configurados a 30 segundos en `vercel.json`.

## 🔄 Flujo de Trabajo

1. **Desarrollo local**:
   - Backend: `npm run dev` (puerto 3001)
   - Frontend: `npm run dev` (puerto 5173)

2. **Producción en Vercel**:
   - Ambos servicios corriendo en el mismo dominio
   - Sin problemas de CORS
   - Configuración optimizada

## 📱 Pruebas

1. **Despliega ambos proyectos**
2. **Actualiza las variables de entorno**
3. **Prueba la conexión frontend → backend**
4. **Verifica las funcionalidades principales**

¡Listo! 🎉 Tu proyecto SaaS estará funcionando en Vercel.
