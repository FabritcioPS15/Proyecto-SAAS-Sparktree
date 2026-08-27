import dotenv from 'dotenv';
dotenv.config();

import { Worker, Job } from 'bullmq';
import pino from 'pino';
import { handleIncomingMessage } from './modules/bots/engine/flow-core';

// Logger simple
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

interface MessageQueueJob {
  messageId: string;
  connectionId: string;
  organizationId: string;
  conversationId: string;
  contactId: string;
  senderPhone: string;
  message: any;
  timestamp: string;
}

// ============================================
// OBTENER CONEXIÓN CON SOCKET VÁLIDO
// ============================================
async function getValidConnection(connectionId: string) {
  const { multiWhatsAppService } = await import('./modules/integrations/multiWhatsAppService');
  
  const connection = multiWhatsAppService.getConnection(connectionId);
  
  if (!connection) {
    logger.warn({ connectionId }, '[Worker] No connection found');
    return null;
  }

  // Verificar que tenga socket y esté conectado
  const socket = (connection as any).socket;
  const status = (connection as any).status;
  
  if (!socket || status !== 'connected') {
    logger.warn(
      { connectionId, status, hasSocket: !!socket }, 
      '[Worker] Connection not ready, attempting to reconnect...'
    );
    
    // Intentar reconectar usando el método privado (acceso por any)
    try {
      await (multiWhatsAppService as any).connectSocket(connection);
      // Esperar un poco a que se conecte
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const reconnectedSocket = (connection as any).socket;
      if (reconnectedSocket) {
        logger.info({ connectionId }, '[Worker] ✅ Reconnection successful');
        return connection;
      }
    } catch (err: any) {
      logger.error({ connectionId, error: err.message }, '[Worker] Reconnection failed');
    }
    
    return null;
  }

  logger.info({ connectionId }, '[Worker] ✅ Valid socket obtained');
  return connection;
}

// ============================================
// CREAR EL WORKER
// ============================================
async function createWorker() {
  logger.info('[Worker] 🚀 Starting WhatsApp message worker...');

  const worker = new Worker<MessageQueueJob>(
    'whatsapp-messages',
    async (job: Job<MessageQueueJob>) => {
      const { messageId, connectionId, organizationId, conversationId, contactId, senderPhone, message } = job.data;

      logger.info({ messageId, connectionId, senderPhone }, '[Worker] 📨 Processing message');

      try {
        const connection = await getValidConnection(connectionId);
        
        if (!connection) {
          throw new Error(`No valid WhatsApp socket for connection ${connectionId}`);
        }

        const socket = (connection as any).socket;

        // Adapter usando el socket REAL con formato correcto de Baileys
        const waServiceAdapter = {
                    sendTextMessage: async (to: string, body: string, options?: { jid?: string }) => {
            try {
              // ✅ CRÍTICO: Usar el JID directamente, sin validación
              // Los LIDs (Linked IDs) de WhatsApp NO responden a onWhatsApp
              let jid = options?.jid;
              if (!jid) {
                jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
              }
              
              logger.info(
                { to: jid, isLid: jid.includes('@lid'), preview: body.substring(0, 50) }, 
                '[Worker] 📤 Sending text'
              );
              
              // ✅ NO validar con onWhatsApp - falla con LIDs
              // Enviar directamente
              const sent = await socket.sendMessage(jid, { 
                text: body,
                // Agregar contexto para mejorar entrega
                contextInfo: {
                  mentionedJid: []
                }
              });
              
              logger.info(
                { waId: sent?.key?.id, to: jid }, 
                '[Worker] ✅ Text sent successfully'
              );
              return sent;
            } catch (error: any) {
              logger.error(
                { 
                  to: options?.jid || to, 
                  error: error.message,
                  stack: error.stack?.split('\n').slice(0, 3).join('\n')
                }, 
                '[Worker] ❌ Error sending text'
              );
              throw error;
            }
          },

          sendButtonMessage: async (to: string, bodyText: string, buttons: any[], options?: { jid?: string }) => {
            try {
              let jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
              
              // Formato texto con opciones numeradas (más compatible)
              const buttonsText = buttons?.map((btn, i) => 
                `*${i + 1}.* ${btn.buttonText || btn.text || btn.label || ''}`
              ).join('\n') || '';
              
              const fullText = `${bodyText}\n\n${buttonsText}\n\n_Responde con el número de tu opción_`;
              
              const sent = await socket.sendMessage(jid, { text: fullText });
              logger.info({ waId: sent?.key?.id }, '[Worker] ✅ Buttons sent');
              return sent;
            } catch (error: any) {
              logger.error({ to, error: error.message }, '[Worker] ❌ Error sending buttons');
              throw error;
            }
          },

          sendMediaMessage: async (to: string, url: string, options?: any) => {
            try {
              let jid = options?.jid || (to.includes('@') ? to : `${to}@s.whatsapp.net`);
              const mediaType = options?.type || 'image';
              
              let messageContent: any;
              
              if (mediaType === 'image') {
                messageContent = { image: { url }, caption: options?.caption || '' };
              } else if (mediaType === 'video') {
                messageContent = { video: { url }, caption: options?.caption || '' };
              } else if (mediaType === 'document') {
                messageContent = { 
                  document: { url }, 
                  mimetype: options?.mimetype || 'application/pdf',
                  fileName: options?.fileName || 'document.pdf'
                };
              } else if (mediaType === 'audio') {
                messageContent = { 
                  audio: { url }, 
                  mimetype: 'audio/mpeg',
                  ptt: options?.voiceNote || false
                };
              } else {
                messageContent = { image: { url }, caption: options?.caption || '' };
              }

              const sent = await socket.sendMessage(jid, messageContent);
              logger.info({ waId: sent?.key?.id }, '[Worker] ✅ Media sent');
              return sent;
            } catch (error: any) {
              logger.error({ to, error: error.message }, '[Worker] ❌ Error sending media');
              throw error;
            }
          },
        };

        const organizationConfig = {
          organizationId,
          conversationId,
          contactId,
          whatsappConnectionId: connectionId,
        };

        await handleIncomingMessage(message, senderPhone, organizationConfig, waServiceAdapter);

        logger.info({ messageId }, '[Worker] ✅ Message processed successfully');
      } catch (error: any) {
        logger.error({ messageId, error: error.message }, '[Worker] ❌ Error processing message');
        throw error;
      }
    },
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 3,
      },
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
      limiter: { max: 100, duration: 60000 },
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '[Worker] ✅ Job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '[Worker] ❌ Job failed');
  });

  logger.info('[Worker] 🎉 Message queue worker started successfully');

  process.on('SIGTERM', async () => {
    logger.info('[Worker] SIGTERM received, shutting down');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('[Worker] SIGINT received, shutting down');
    await worker.close();
    process.exit(0);
  });
}

createWorker().catch((error) => {
  console.error('[Worker] 💥 Fatal error:', error);
  process.exit(1);
});