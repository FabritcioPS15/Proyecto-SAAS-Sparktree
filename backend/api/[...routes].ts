import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { verifyWebhook, handleIncomingWebhook } from '../src/controllers/webhookController';
import usersRoutes from '../src/routes/users';
import conversationsRoutes from '../src/routes/conversations';
import analyticsRoutes from '../src/routes/analytics';
import settingsRoutes from '../src/routes/settings';
import flowsRoutes from '../src/routes/flows';
import qrRoutes from '../src/routes/whatsappQR';
import leadsRoutes from '../src/routes/leads';
import debugRoutes from '../src/routes/debug';
import adminRoutes from '../src/routes/admin';
import authRoutes from '../src/routes/auth';
import { multiWhatsAppService } from '../src/services/multiWhatsAppService';

import { tenantMiddleware } from '../src/middleware/tenant';
const app = express();

// Supabase is a cloud DB, no persistent connection needed

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(tenantMiddleware);

// Rutas base para el frontend y validación
app.get('/', (req: Request, res: Response) => {
  res.send('API Backend del SaaS de WhatsApp Funcionando Correctamente');
});

// APIs para el Dashboard
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/flows', flowsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Rutas de WhatsApp Webhook
app.get('/api/webhook', verifyWebhook);
app.post('/api/webhook', handleIncomingWebhook);

// Iniciar servidor localmente si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor local corriendo en puerto ${PORT}`);
  });
}

// Iniciar todas las conexiones de WhatsApp al arrancar
const initializeWhatsApp = async () => {
  try {
    const { data: connections } = await require('../config/supabase').supabase
      .from('whatsapp_connections')
      .select('*');
    
    for (const conn of connections || []) {
      await multiWhatsAppService.initializeConnection(conn);
    }
    console.log(`[Backend] Initialized ${connections?.length || 0} WhatsApp connections`);
  } catch (err) {
    console.error('Error auto-initializing WhatsApp connections:', err);
  }
};

initializeWhatsApp();

// Exportar como handler serverless para Vercel
export default app;
