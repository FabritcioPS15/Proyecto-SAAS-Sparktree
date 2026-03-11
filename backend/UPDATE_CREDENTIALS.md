# 🔧 ACTUALIZAR CREDENCIALES DE SUPABASE

## 📋 Credenciales Correctas (del proyecto actual)

### **URL del Proyecto:**
```
https://kfjgevdxsobhbbbhnvrt.supabase.co
```

### **SERVICE_ROLE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmdldmR4c29iaGJiYmhudnJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE5Nzc0MCwiZXhwIjoyMDg4NzczNzQwfQ.37VNoz4pbqhvY4VG2cjs6wi7pUI0EMjE4bZb5gmYzns
```

### **ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmdldmR4c29iaGJiYmhudnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTc3NDAsImV4cCI6MjA4ODc3Mzc0MH0.SdULsDogjnv3NmRFpXrIpQsKfgOKml8yKWPt0rFXxJw
```

## 🔧 Pasos para Corregir

### **1. Actualizar el archivo .env del backend:**

Abre el archivo: `c:\Users\Sistemas\Downloads\Aa\Proyecto-SAAS-Sparktree\backend\.env`

Y reemplaza con:

```env
# ============================================================
# Backend Environment Variables - Sparktree SaaS
# NEVER commit the real .env file to GitHub!
# ============================================================

# --- Supabase Database ---
SUPABASE_URL=https://kfjgevdxsobhbbbhnvrt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmdldmR4c29iaGJiYmhudnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTc3NDAsImV4cCI6MjA4ODc3Mzc0MH0.SdULsDogjnv3NmRFpXrIpQsKfgOKml8yKWPt0rFXxJw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmdldmR4c29iaGJiYmhudnJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE5Nzc0MCwiZXhwIjoyMDg4NzczNzQwfQ.37VNoz4pbqhvY4VG2cjs6wi7pUI0EMjE4bZb5gmYzns

# --- WhatsApp Meta Cloud API ---
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=my_webhook_secret

# --- General ---
PORT=3000
NODE_ENV=development
```

### **2. Reiniciar el backend:**

```bash
# Detener el servidor actual (Ctrl+C)
# Luego iniciar nuevamente:
npm run dev
```

### **3. Verificar que funciona:**

```bash
# Probar la API de conversaciones
Invoke-RestMethod -Uri "http://localhost:3000/api/conversations" -Method Get
```

Debería devolver la conversación de Fabritcio.

## 🎯 Resultado Esperado

Una vez actualizado el .env:

✅ **API devolverá 1 conversación**
✅ **Frontend mostrará la conversación de Fabritcio**
✅ **Podrás ver todos los mensajes**
✅ **Todo funcionará perfectamente**

---
**🔧 Con estas credenciales correctas, el sistema funcionará perfectamente.**
