import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import all routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import conversationRoutes from './modules/chat/conversations.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import settingsRoutes from './modules/settings/settings.routes';
import flowRoutes from './modules/bots/bots.routes';
import leadRoutes from './modules/leads/leads.routes';
import qrRoutes from './modules/integrations/qr.routes';
import whatsappConnectionsRoutes from './modules/integrations/whatsappConnections.routes';
import whatsappQRRoutes from './modules/integrations/whatsappQR.routes';
import adminRoutes from './modules/admin/admin.routes';
import debugRoutes from './modules/system/debug.routes';
import multiWhatsAppRoutes from './modules/integrations/multiWhatsApp.routes';
import platformRoutes from './modules/integrations/platform.routes';
import webhookRoutes from './modules/system/webhooks.routes';
import assignmentRoutes from './modules/chat/assignment.routes';
import internalNotesRoutes from './modules/chat/internalNotes.routes';
import inboxRoutes from './modules/chat/inbox.routes';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// WebSocket setup for real-time connection status (RF-02)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Export io instance for use in services
export { io };

// Middleware
const allowedOrigins: string[] = [
  'http://localhost:5173',
  'http://192.168.1.63:5173',
  'http://192.168.191.131:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request timeout middleware (RNF-02: 3-second response time)
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`[Timeout] Request to ${req.originalUrl} exceeded 3 seconds`);
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request processing exceeded time limit',
        timestamp: new Date().toISOString()
      });
    }
  }, 3000); // 3 second timeout

  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
});

// Request Logger (RNF-07: Centralized logging to Docker stdout)
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Body: ${JSON.stringify(req.body)}`;
  console.log(logMsg);
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
// TEMPORARILY DISABLED FOR DEVELOPMENT
import { authenticateToken } from './core/middleware/auth';
import { tenantMiddleware } from './core/middleware/tenant';

// Webhook routes (no auth required)
app.use('/api/webhooks', webhookRoutes);

// app.use('/api', authenticateToken);
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
app.use('/api/platform', platformRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/internal-notes', internalNotesRoutes);
app.use('/api/inbox', inboxRoutes);

// Webhook routes moved above tenantMiddleware

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
import { multiWhatsAppService } from './modules/integrations/multiWhatsAppService';
import { multiPlatformService } from './modules/integrations/platform/multiPlatformService';

// WebSocket connection handling (RF-02)
io.on('connection', (socket: any) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on('join-organization', (organizationId: string) => {
    socket.join(`org:${organizationId}`);
    console.log(`[WebSocket] Client ${socket.id} joined organization ${organizationId}`);
  });

  socket.on('leave-organization', (organizationId: string) => {
    socket.leave(`org:${organizationId}`);
    console.log(`[WebSocket] Client ${socket.id} left organization ${organizationId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, async () => {
  console.log(`🚀 Sparktree SaaS Backend running on port ${PORT}`);
  console.log(`🔌 WebSocket server enabled for real-time updates`);
  
  // Initialize WhatsApp connections
  try {
    await multiWhatsAppService.initializeAllConnections();
  } catch (error) {
    console.error('Failed to initialize WhatsApp connections:', error);
  }

  // Initialize multi-platform connections (Telegram, Instagram, TikTok)
  try {
    await multiPlatformService.initializeAllConnections();
  } catch (error) {
    console.error('Failed to initialize multi-platform connections:', error);
  }

  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 WhatsApp Connections API: http://localhost:${PORT}/api/whatsapp-connections`);
  console.log(`📸 QR API: http://localhost:${PORT}/api/qr`);
  console.log(`🌐 Platform Connections API: http://localhost:${PORT}/api/platform/connections`);
  console.log(`🔗 Webhooks: http://localhost:${PORT}/api/webhooks`);
});

export default app;
