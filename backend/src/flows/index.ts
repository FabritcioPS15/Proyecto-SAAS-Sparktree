import WhatsAppService from '../services/whatsappService';
import { supabase } from '../config/supabase';
import axios from 'axios';

export async function handleIncomingMessage(
  message: any,
  senderPhone: string,
  organizationConfig: { phoneNumberId?: string; accessToken?: string, organizationId?: string, conversationId?: string, contactId?: string },
  waService: any // Pass the service instance (Cloud or QR)
) {

  const saveOutgoingMessage = async (type: string, content: any, waResponse: any) => {
    if (organizationConfig.organizationId && organizationConfig.conversationId && organizationConfig.contactId) {
      await supabase.from('messages').insert({
        organization_id: organizationConfig.organizationId,
        conversation_id: organizationConfig.conversationId,
        contact_id: organizationConfig.contactId,
        direction: 'outbound',
        type: type,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        status: 'sent',
        whatsapp_message_id: waResponse?.messages?.[0]?.id
      });

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', organizationConfig.conversationId);
    }
  };

  const executeNode = async (flow: any, nodeId: string) => {
    let currentNodeId: string | null = nodeId;

    while (currentNodeId) {
      console.log(`[Flow Engine] Executing node ID: ${currentNodeId}`);
      const node = flow.nodes.find((n: any) => n.id === currentNodeId);
      if (!node) {
        console.log(`[Flow Engine] Node ${currentNodeId} not found in flow definition!`);
        break;
      }
      console.log(`[Flow Engine] Node type: ${node.type}`);

      if (node.type === 'trigger') {
        console.log(`[Flow Engine] Trigger node detected. Proceeding to connected block.`);
      } else if (node.type === 'text') {
        try {
          console.log(`[Flow Engine] Sending text message: "${node.data?.text}" to ${senderPhone}`);
          const res = await waService.sendTextMessage(senderPhone, node.data?.text || '');
          console.log(`[Flow Engine] Text message sent successfully. Response:`, res?.key ? 'OK' : 'Unknown');
          await saveOutgoingMessage('text', node.data?.text, res);
        } catch (error) {
          console.error(`[Flow Engine] ERROR sending text message:`, error);
        }
      } else if (node.type === 'interactive') {
        const res = await waService.sendButtonMessage(
          senderPhone,
          node.data?.bodyText || '',
          node.data?.buttons || []
        );
        // Guardar el response completo que incluye buttonMapping
        await saveOutgoingMessage('interactive', res, res);
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
        await supabase
          .from('contacts')
          .update({ bot_state: `capture_${currentNodeId}` })
          .eq('id', organizationConfig.contactId);
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
        await supabase
          .from('contacts')
          .update({ bot_state: 'handoff' })
          .eq('id', organizationConfig.contactId);
        break; // Pause bot
      } else if (node.type === 'delay') {
        const waitTime = (node.data?.delaySeconds || 3) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Find next node
      const nextEdge = flow.edges.find((e: any) => e.source === currentNodeId);
      if (nextEdge && nextEdge.target && !['interactive', 'capture', 'handoff'].includes(node.type)) {
        console.log(`[Flow Engine] Moving to next node via edge: ${nextEdge.id} -> ${nextEdge.target}`);
        currentNodeId = nextEdge.target;
      } else {
        console.log(`[Flow Engine] Flow execution stopped at node ${currentNodeId} (No valid next edge found or waiting for user input).`);
        currentNodeId = null;
      }
    }
  };

  if (message.type === 'text') {
    const textBody = message.text.body.trim();
    const textLower = textBody.toLowerCase();
    console.log(`[Bot Engine] Processing text message: "${textBody}" from ${senderPhone}`);

    // Check if in handoff
    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', organizationConfig.contactId)
      .single();

    if (contact?.bot_state === 'handoff') {
      console.log('[Bot Engine] Contact is in handoff mode. Bot is paused.');
      return; // Bot is silent, human agent is handling
    }

    // Get active flow
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('*')
      .eq('organization_id', organizationConfig.organizationId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (flowError) {
      console.error('Error fetching active flow:', flowError);
    } else if (flow) {
      console.log(`[Bot Engine] Active flow found: ${flow.name}`);
    } else {
      console.log('[Bot Engine] No active flow found for this organization.');
      return;
    }

    // Check if waiting for capture input
    if (contact?.bot_state?.startsWith('capture_')) {
      const nodeId = contact.bot_state.replace('capture_', '');
      console.log(`[Bot Engine] Capture mode active for node: ${nodeId}`);
      await executeNode(flow, nodeId);
      return;
    }

    // PRIORITY 1: Check if this is a trigger for starting the flow
    if (flow.triggers && Array.isArray(flow.triggers)) {
      const matchedTrigger = flow.triggers.find((trigger: string) => 
        trigger && textLower.includes(trigger.toLowerCase())
      );

      if (matchedTrigger) {
        console.log(`[Bot Engine] Trigger matched: "${matchedTrigger}"`);
        // Find trigger node (usually node ID "1")
        const triggerNode = flow.nodes.find((n: any) => n.type === 'trigger');
        if (triggerNode) {
          await executeNode(flow, triggerNode.id);
          return;
        }
      }
    }

    // PRIORITY 2: Handle Numeric Button replies (only if not a trigger)
    if (message.isNumericButtonResponse) {
      const buttonNumber = message.buttonNumber;
      console.log(`[Bot Engine] Processing numeric button response: ${buttonNumber}`);

      // Get the last interactive message sent to this conversation to find button mapping
      const { data: lastInteractive } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', organizationConfig.conversationId)
        .eq('direction', 'outbound')
        .eq('type', 'interactive')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastInteractive && lastInteractive.content) {
        try {
          const interactiveData = JSON.parse(lastInteractive.content);
          console.log(`[Flow Engine] Found interactive data:`, interactiveData);
          
          if (interactiveData.buttonMapping && interactiveData.buttonMapping[buttonNumber]) {
            const buttonId = interactiveData.buttonMapping[buttonNumber];
            console.log(`[Flow Engine] Mapped numeric ${buttonNumber} to button ID: ${buttonId}`);

            if (flow && flow.edges) {
              const edge = flow.edges.find((e: any) => e.sourceHandle === buttonId || e.source === buttonId);
              if (edge && edge.target) {
                console.log(`[Flow Engine] Found edge: ${edge.id}, moving to node: ${edge.target}`);
                await executeNode(flow, edge.target);
                return;
              } else {
                console.log(`[Flow Engine] No edge found for button ID: ${buttonId}`);
              }
            }
          } else {
            console.log(`[Flow Engine] No button mapping found for number: ${buttonNumber}`);
            console.log(`[Flow Engine] Available mappings:`, interactiveData.buttonMapping);
          }
        } catch (parseError) {
          console.log(`[Flow Engine] Could not parse message content for button mapping:`, parseError);
        }
      } else {
        console.log(`[Flow Engine] No last interactive message found for conversation ${organizationConfig.conversationId}`);
      }

      // Si no se pudo procesar como respuesta de botón, dejar que el flujo normal lo procese
      console.log(`[Flow Engine] Could not process numeric response as button, continuing to fallback`);
    }

    // PRIORITY 3: Fallback if no trigger matched and not a valid button response
    console.log('[Bot Engine] No trigger matched. Sending fallback message.');
    const fallbackText = 'No entendí ese comando. Intenta con otras palabras clave configuradas en tus Flujos.';
    const res = await waService.sendTextMessage(senderPhone, fallbackText);
    await saveOutgoingMessage('text', fallbackText, res);
  }

  // Handle Interactive Button replies
  if (message.type === 'interactive') {
    const buttonId = message.interactive.button_reply.id;

    const { data: flow } = await supabase
      .from('flows')
      .select('*')
      .eq('organization_id', organizationConfig.organizationId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (flow && flow.edges) {
      const edge = flow.edges.find((e: any) => e.sourceHandle === buttonId || e.source === buttonId);
      if (edge && edge.target) {
        await executeNode(flow, edge.target);
        return;
      }
    }

    const fallbackText = 'Opción no reconocida o flujo incompleto.';
    const res = await waService.sendTextMessage(senderPhone, fallbackText);
    await saveOutgoingMessage('text', fallbackText, res);
  }
}
