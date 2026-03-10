import express, { Request, Response } from 'express';
import cors from 'cors';
import { verifyWebhook, handleIncomingWebhook } from '../src/controllers/webhookController';
import connectDB from '../src/config/db';
import usersRoutes from '../src/routes/users';
import conversationsRoutes from '../src/routes/conversations';
import analyticsRoutes from '../src/routes/analytics';
import settingsRoutes from '../src/routes/settings';
import flowsRoutes from '../src/routes/flows';

const app = express();
connectDB(); // Inicializar conexión a DB

app.use(cors());
app.use(express.json());

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

// Exportar como handler serverless para Vercel
export default app;
