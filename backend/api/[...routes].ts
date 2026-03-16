import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { verifyWebhook, handleIncomingWebhook } from '../src/controllers/webhookController';
import usersRoutes from '../src/routes/users';
import conversationsRoutes from '../src/routes/conversations';
import analyticsRoutes from '../src/routes/analytics';
import settingsRoutes from '../src/routes/settings';
import flowsRoutes from '../src/routes/flows';
import dashboardRoutes from '../src/routes/dashboard';
import whatsappNumbersRoutes from '../src/routes/whatsappNumbers';
import qrRoutes from '../src/routes/whatsappQR';
import leadsRoutes from '../src/routes/leads';
import debugRoutes from '../src/routes/debug';
import { qrService } from '../src/services/whatsappQRService';

const app = express();

// Supabase is a cloud DB, no persistent connection needed

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp-numbers', whatsappNumbersRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/debug', debugRoutes);

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

// Iniciar el servicio de QR automáticamente al arrancar
qrService.initialize().catch(err => console.error('Error auto-initializing QR service:', err));

// Exportar como handler serverless para Vercel
export default app;
