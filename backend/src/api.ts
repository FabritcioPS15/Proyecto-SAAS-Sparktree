import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Import all routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import conversationRoutes from './routes/conversations';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import flowRoutes from './routes/flows';
import leadRoutes from './routes/leads';
import qrRoutes from './routes/qr';
import whatsappConnectionsRoutes from './routes/whatsappConnections';
import whatsappQRRoutes from './routes/whatsappQR';
import adminRoutes from './routes/admin';
import debugRoutes from './routes/debug';
import multiWhatsAppRoutes from './routes/multiWhatsApp';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});



// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Sparktree SaaS Backend'
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Auth and Tenant Middleware (Applied to all following /api routes)
import { authenticateToken } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';

app.use('/api', authenticateToken);
app.use('/api', tenantMiddleware);

app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/whatsapp-connections', whatsappConnectionsRoutes);
app.use('/api/whatsapp-qr', whatsappQRRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/multi-whatsapp', multiWhatsAppRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
import { multiWhatsAppService } from './services/multiWhatsAppService';

app.listen(PORT, async () => {
  console.log(`🚀 Sparktree SaaS Backend running on port ${PORT}`);
  
  // Initialize WhatsApp connections
  try {
    await multiWhatsAppService.initializeAllConnections();
  } catch (error) {
    console.error('Failed to initialize WhatsApp connections:', error);
  }

  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 WhatsApp Connections API: http://localhost:${PORT}/api/whatsapp-connections`);
  console.log(`📸 QR API: http://localhost:${PORT}/api/qr`);
});

export default app;
