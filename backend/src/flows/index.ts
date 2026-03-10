import WhatsAppService from '../services/whatsappService';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Contact from '../models/Contact';
import Flow from '../models/Flow';
import axios from 'axios';

export async function handleIncomingMessage(
  message: any,
  senderPhone: string,
  organizationConfig: { phoneNumberId?: string; accessToken?: string, organizationId?: string, conversationId?: string, contactId?: string }
) {
  const waService = new WhatsAppService(organizationConfig);
  
  const saveOutgoingMessage = async (type: string, content: any, waResponse: any) => {
    if (organizationConfig.organizationId && organizationConfig.conversationId && organizationConfig.contactId) {
      const outMsg = new Message({
         organizationId: organizationConfig.organizationId,
         conversationId: organizationConfig.conversationId,
         contactId: organizationConfig.contactId,
         direction: 'outbound',
         type: type,
         content: content,
         status: 'sent',
         whatsappMessageId: waResponse?.messages?.[0]?.id
      });
      await outMsg.save();

      await Conversation.findByIdAndUpdate(organizationConfig.conversationId, {
         lastMessageAt: new Date()
      });
    }
  };

  const executeNode = async (flow: any, nodeId: string) => {
    let currentNodeId = nodeId;

    while (currentNodeId) {
      const node = flow.nodes.find((n: any) => n.id === currentNodeId);
      if (!node) break;

      let waitBeforeNextMs = 0;

      if (node.type === 'text') {
        const res = await waService.sendTextMessage(senderPhone, node.data?.text || '');
        await saveOutgoingMessage('text', node.data?.text, res);
      } else if (node.type === 'interactive') {
        const res = await waService.sendButtonMessage(
          senderPhone,
          node.data?.bodyText || '',
          node.data?.buttons || []
        );
        await saveOutgoingMessage('interactive', node.data?.bodyText, res);
        break; // Wait for user button click
      } else if (node.type === 'media') {
        const url = node.data?.mediaUrl;
        if (url) {
          const res = await waService.sendMediaMessage(senderPhone, url);
          await saveOutgoingMessage('media', url, res);
        }
      } else if (node.type === 'capture') {
        const res = await waService.sendTextMessage(senderPhone, node.data?.question || '?');
        await saveOutgoingMessage('capture', node.data?.question, res);
        await Contact.findByIdAndUpdate(organizationConfig.contactId, {
          botState: `capture_${currentNodeId}`
        });
        break; // Wait for user text input
      } else if (node.type === 'webhook') {
        try {
          await axios({
            method: node.data?.method || 'POST',
            url: node.data?.url,
            data: {
              contactPhone: senderPhone,
              contactId: organizationConfig.contactId
            }
          });
        } catch (error) {
           console.error('Webhook node failed:', error);
        }
      } else if (node.type === 'handoff') {
        await Contact.findByIdAndUpdate(organizationConfig.contactId, {
          botState: 'handoff'
        });
        break; // Pause bot
      } else if (node.type === 'delay') {
        waitBeforeNextMs = (node.data?.delaySeconds || 3) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitBeforeNextMs));
      }

      // Encontrar siguiente nodo
      const nextEdge = flow.edges.find((e: any) => e.source === currentNodeId);
      if (nextEdge && nextEdge.target && node.type !== 'interactive' && node.type !== 'capture' && node.type !== 'handoff') {
        currentNodeId = nextEdge.target;
      } else {
        currentNodeId = null;
      }
    }
  };

  if (message.type === 'text') {
    const textBody = message.text.body.trim();
    const textLower = textBody.toLowerCase();
    
    // Check if in handoff
    const contact = await Contact.findById(organizationConfig.contactId);
    if (contact?.botState === 'handoff') {
       // Currently handled by an agent, bot ignores all text messages
       return;
    }

    const flow = await Flow.findOne({ organizationId: organizationConfig.organizationId, isActive: true });
    
    // Check if waiting for capture
    if (contact?.botState && contact.botState.startsWith('capture_') && flow) {
       const captureNodeId = contact.botState.split('_')[1];
       const captureNode = flow.nodes.find((n: any) => n.id === captureNodeId);
       
       if (captureNode) {
          const varName = captureNode.data?.variableName || 'respuesta';
          // Save valid text answer
          contact.customAttributes = contact.customAttributes || new Map();
          contact.customAttributes.set(varName, textBody);
          contact.botState = 'main_menu'; // Reset
          await contact.save();
          
          // Execute next
          const nextEdge = flow.edges.find((e: any) => e.source === captureNode.id);
          if (nextEdge && nextEdge.target) {
            await executeNode(flow, nextEdge.target);
          }
          return;
       }
    }

    let matchedTriggerNode = null;
    
    if (flow && flow.nodes) {
       // Buscar nodo trigger que coincida
       matchedTriggerNode = flow.nodes.find((n: any) => 
         n.type === 'trigger' && 
         n.data?.keywords?.some((k: string) => textLower.includes(k.toLowerCase()))
       );
    }

    if (matchedTriggerNode && flow) {
       // Encontramos un trigger, vamos a ejecutar el siguiente nodo
       const firstEdge = flow.edges.find((e: any) => e.source === matchedTriggerNode.id);
       if (firstEdge && firstEdge.target) {
          await executeNode(flow, firstEdge.target);
       }
       return;
    }

    // Default Fallback si no hay flujos coincidentes
    const fallbackText = "No entendí ese comando. Pudes intentar con otras palabras clave configuradas en tus Flujos.";
    const res = await waService.sendTextMessage(senderPhone, fallbackText);
    await saveOutgoingMessage('text', fallbackText, res);
  }

  // Handle Interactive Button replies
  if (message.type === 'interactive') {
    const buttonId = message.interactive.button_reply.id;
    const flow = await Flow.findOne({ organizationId: organizationConfig.organizationId, isActive: true });
    
    if (flow && flow.edges) {
      // Find the edge connected to this specific button
      const edge = flow.edges.find((e: any) => e.sourceHandle === buttonId || e.source === buttonId);
      
      if (edge && edge.target) {
        await executeNode(flow, edge.target);
        return;
      }
    }

    const fallbackText = "Opción no reconocida o flujo incompleto.";
    const res = await waService.sendTextMessage(senderPhone, fallbackText);
    await saveOutgoingMessage('text', fallbackText, res);
  }
}
