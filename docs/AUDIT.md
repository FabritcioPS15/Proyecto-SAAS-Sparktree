# 📊 Reporte de Auditoría del Sistema (FASE 2)

> **Fecha:** 2026-06-09  
> **Estado:** Completada  
> **Objetivo:** Mapear estructura de BD, dependencias y riesgos antes de iniciar la modularización profunda de la Fase 3.

---

## 1. Inventario de Base de Datos (PostgreSQL)

El proyecto utiliza PostgreSQL a través de Supabase (`@supabase/supabase-js`) y conexión directa (`pg` Pool). **Nota:** Todo el código relacionado a Mongoose en `src/models/*.ts` y `src/config/db.ts` es considerado "código muerto".

### Tablas Principales
*   **Core:** `organizations`, `users`
*   **Conexiones:** `platform_connections` (evolución de `whatsapp_connections`)
*   **Configuración de Plataformas:** `telegram_bot_configs`, `instagram_configs`, `tiktok_configs`
*   **Chat Core:** `contacts`, `conversations`, `messages`
*   **Automatización (Bots):** `flows`, `flow_assignments`, `flow_executions`
*   **Métricas:** `analytics`

---

## 2. Inventario de Endpoints (Backend)

Existen **18 grupos de rutas principales** registrados en `src/api.ts`:

| Archivo de Ruta | Dominio Lógico Destino | Dependencias Clave (Servicios) |
| :--- | :--- | :--- |
| `auth.ts` | **Auth** | Supabase Auth, bcrypt |
| `users.ts` | **Users** | Supabase DB |
| `admin.ts` | **Admin** | `adminService` |
| `conversations.ts` | **Chat/Inbox** | `supabase` |
| `inbox.ts` | **Chat/Inbox** | `supabase` |
| `internalNotes.ts`| **Chat/Inbox** | `internalNotesService` |
| `assignment.ts` | **Chat/Inbox** | `assignmentService` |
| `flows.ts` | **Bots** | `flows` engine |
| `analytics.ts` | **Analytics** | Supabase DB |
| `leads.ts` | **Leads/CRM** | (Futuro módulo) |
| `settings.ts` | **Settings** | Supabase DB |
| `webhooks.ts` | **Webhooks** | `webhookController`, motor de flujos |
| `whatsappConnections.ts`| **Integrations** | `whatsappService` |
| `whatsappQR.ts` | **Integrations** | `whatsappQRService` |
| `multiWhatsApp.ts` | **Integrations** | `multiWhatsAppService` |
| `platform.ts` | **Integrations** | `multiPlatformService` |
| `qr.ts` | **Integrations** | (Utilidades QR) |
| `debug.ts` | **Dev/Tools** | - |

---

## 3. Dependencias e Integraciones de Servicios

El núcleo del negocio se encuentra fuertemente acoplado en las siguientes dependencias internas que deberemos desenredar:

1.  **El Motor de Flujos (`src/flows/index.ts`):** 
    *   **Problema:** Centraliza demasiada lógica de enrutamiento y procesamiento. Llama directamente a servicios de WhatsApp o plataforma.
    *   **Acción:** Mover a `modules/bots/engine` y que devuelva "intenciones de respuesta" en lugar de llamar a las APIs de terceros directamente.
2.  **Servicios de Plataforma (`src/services/platform/`):**
    *   Contiene servicios específicos (`telegramService`, `instagramService`, `mercadolibreService`, etc.).
    *   **Problema:** Se instancia junto con `multiWhatsAppService`.
    *   **Acción:** Aislarlos completamente en la Fase 6 usando un patrón Adapter (`IPlatformProvider`).
3.  **Gestión de Estado Asíncrono:**
    *   Utiliza `queueService.ts` y `messageQueueService.ts` conectados a Redis.
    *   BullMQ procesa jobs en `worker.ts`.
    *   **Acción:** Extraer progresivamente hacia `apps/workers/` en la Fase 10.

---

## 4. Detección de Riesgos y Posibles Ciclos

| Riesgo Detectado | Nivel | Mitigación Propuesta |
| :--- | :--- | :--- |
| **Middlewares Centralizados:** `auth.ts` y `tenant.ts` están sueltos y se aplican globalmente en `api.ts`. | 🟡 Medio | Moverlos a `core/middlewares/` e inyectar el tenant explícitamente. |
| **Modelos Huérfanos:** Toda la carpeta `src/models/` contiene esquemas Mongoose no utilizados. | 🟢 Bajo | Eliminar en la Fase 3, puesto que la BD es PostgreSQL y se interactúa vía SQL bruto o Supabase. |
| **Código Muerto en `config/db.ts`:** Setup inicial de MongoDB no utilizado. | 🟢 Bajo | Ya marcado como `@deprecated`. Será eliminado. |
| **Webhooks Acoplados:** El recibo de mensajes de Webhook inyecta la carga directamente al motor de Flows. | 🟠 Alto | Desacoplar. `webhooks/` debe recibir, encolar en Redis, y responder HTTP 200 rápido (exigido por Meta RNF-02). El worker procesará el Flow. |
| **Multi-Tenancy por defecto:** El middleware usa un tenant por defecto si no viene del header. | 🔴 Crítico | Restringir estrictamente en la Fase 5. Cada entidad **debe** proveer su `organizationId`. |

---

## Siguiente Paso

Se iniciará la **Fase 3: Cimientos del Backend**. 
Consiste en la creación de las carpetas `core/` (config, middleware, logger) y `shared/`, actualizando los imports existentes sin alterar la lógica de negocio.
