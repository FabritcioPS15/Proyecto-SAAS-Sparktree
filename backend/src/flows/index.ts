import WhatsAppService from '../services/whatsappService';
import { supabase } from '../config/supabase';
import axios from 'axios';

export async function handleIncomingMessage(
  message: any,
  senderPhone: string,
  organizationConfig: { phoneNumberId?: string; accessToken?: string, organizationId?: string, conversationId?: string, contactId?: string, whatsappConnectionId?: string, senderJid?: string },
  waService: any, // Pass the service instance (Cloud or QR)
  preloadedFlow?: any // Pass a specific flow if one is already resolved
) {

  // Fetch contact to get stored JID if available
  const { data: contactData } = await supabase
    .from('contacts')
    .select('*, custom_attributes')
    .eq('id', organizationConfig.contactId)
    .single();

  const contactJid = organizationConfig.senderJid || (contactData as any)?.custom_attributes?.whatsapp_jid;

  const saveOutgoingMessage = async (type: string, content: any, waResponse: any) => {
    if (organizationConfig.conversationId && organizationConfig.contactId) {
      await supabase.from('messages').insert({
        organization_id: organizationConfig.organizationId,
        conversation_id: organizationConfig.conversationId,
        contact_id: organizationConfig.contactId,
        direction: 'outbound',
        type: type,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        status: 'sent',
        whatsapp_message_id: waResponse?.key?.id
      });

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', organizationConfig.conversationId);
    }
  };

  // Track flow execution start
  const trackFlowExecution = async (flowId: string, triggerWord?: string) => {
    try {
      const { error } = await supabase.from('flow_executions').insert({
        organization_id: organizationConfig.organizationId,
        flow_id: flowId,
        contact_id: organizationConfig.contactId,
        conversation_id: organizationConfig.conversationId,
        trigger_word: triggerWord,
        status: 'started'
      });
      
      if (error) {
        console.error('[Flow Engine] Error tracking flow execution:', error);
      }
    } catch (error) {
      console.error('[Flow Engine] Exception tracking flow execution:', error);
    }
  };

  // Update flow execution status
  const updateFlowExecution = async (flowId: string, status: 'completed' | 'failed' | 'abandoned') => {
    try {
      const { error } = await supabase
        .from('flow_executions')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('organization_id', organizationConfig.organizationId)
        .eq('flow_id', flowId)
        .eq('contact_id', organizationConfig.contactId)
        .eq('status', 'started')
        .is('completed_at', null)
        .order('executed_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('[Flow Engine] Error updating flow execution:', error);
      }
    } catch (error) {
      console.error('[Flow Engine] Exception updating flow execution:', error);
    }
  };

  const executeNode = async (flow: any, nodeId: string) => {
    let currentNodeId: string | null = nodeId;

    while (currentNodeId) {
      console.log(`[Flow Engine] Executing node ID: ${currentNodeId}`);
      
      if (!flow.nodes || !Array.isArray(flow.nodes)) {
        console.error('[Flow Engine] Flow nodes missing or not an array!');
        break;
      }

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
          console.log(`[Flow Engine] Sending text message: "${node.data?.text}" to ${senderPhone} (JID: ${contactJid || 'using phone'})`);
          const res = await waService.sendTextMessage(senderPhone, node.data?.text || '', { jid: contactJid });
          console.log(`[Flow Engine] Text message sent successfully. Response:`, res?.key ? 'OK' : 'Unknown');
          await saveOutgoingMessage('text', node.data?.text, res);
        } catch (error) {
          console.error(`[Flow Engine] ERROR sending text message:`, error);
        }
      } else if (node.type === 'interactive') {
        const res = await waService.sendButtonMessage(
          senderPhone,
          node.data?.bodyText || '',
          node.data?.buttons || [],
          { jid: contactJid }
        );
        // Guardar el response completo que incluye buttonMapping
        await saveOutgoingMessage('interactive', res, res);
        break; // Wait for user button click
      } else if (node.type === 'media') {
        const url = node.data?.mediaUrl;
        const caption = node.data?.caption;
        const type = node.data?.mediaType || 'image';
        
        if (url) {
          console.log(`[Flow Engine] Sending media (${type}): ${url}`);
          const res = await waService.sendMediaMessage(senderPhone, url, { 
            jid: contactJid,
            caption: caption,
            type: type,
            fileName: node.data?.fileName,
            viewOnce: !!node.data?.isViewOnce
          });
          await saveOutgoingMessage('media', { url, caption, type, fileName: node.data?.fileName, viewOnce: !!node.data?.isViewOnce }, res);
        }
      } else if (node.type === 'capture') {
        const res = await waService.sendTextMessage(senderPhone, node.data?.question || '?', { jid: contactJid });
        await saveOutgoingMessage('capture', node.data?.question, res);
        await supabase
          .from('contacts')
          .update({ bot_state: `capture_${currentNodeId}` })
          .eq('id', organizationConfig.contactId)
          .eq('organization_id', organizationConfig.organizationId);
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
          .eq('id', organizationConfig.contactId)
          .eq('organization_id', organizationConfig.organizationId);
        break; // Pause bot
      } else if (node.type === 'delay') {
        const waitTime = (node.data?.delaySeconds || 3) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Find next node
      const nextEdge = (flow.edges || []).find((e: any) => e.source === currentNodeId);
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
    if (!message?.text?.body) {
      console.log(`[Bot Engine] Received text message with no body (maybe empty or unsupported type). Skipping bot processing.`);
      return;
    }

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
      console.log(`[Bot Engine] Contact ${senderPhone} is in handoff mode. Bot is paused for connection ${organizationConfig.whatsappConnectionId}.`);
      return; // Bot is silent, human agent is handling
    }

    // Get active flow
    let flow = preloadedFlow;
    
    if (!flow) {
      if (organizationConfig.whatsappConnectionId) {
        console.log(`[Bot Engine] Checking specific assignment for connection ${organizationConfig.whatsappConnectionId}`);
        const { data: assignments } = await supabase
          .from('flow_assignments')
          .select(`flows!inner(*)`)
          .eq('whatsapp_connection_id', organizationConfig.whatsappConnectionId)
          .eq('is_active', true);
        
        if (assignments && assignments.length > 0) {
          flow = (assignments[0] as any).flows;
          console.log(`[Bot Engine] Specific flow assignment found: ${flow.name}`);
        }
      }

      if (!flow) {
        console.log(`[Bot Engine] No specific connection assignment, checking default flows for org ${organizationConfig.organizationId}`);
        const { data: fetchedFlow } = await supabase
          .from('flows')
          .select('*')
          .eq('organization_id', organizationConfig.organizationId)
          .eq('is_active', true)
          .order('is_default', { ascending: false })
          .limit(1)
          .maybeSingle();
        flow = fetchedFlow;
        if (flow) {
          console.log(`[Bot Engine] Using default organization flow: ${flow.name}`);
        }
      }
    }

    if (!flow) {
      console.log(`[Bot Engine] No active flow found for sender ${senderPhone} (Connection: ${organizationConfig.whatsappConnectionId})`);
      return;
    } else {
      console.log(`[Bot Engine] Active flow for processing: ${flow.name} (ID: ${flow.id})`);
    }

    // Check if waiting for capture input
    if (contact?.bot_state?.startsWith('capture_')) {
      const nodeId = contact.bot_state.replace('capture_', '');
      const node = flow.nodes.find((n: any) => n.id === nodeId);
      
      if (node) {
        console.log(`[Bot Engine] Capture mode active for node: ${nodeId}. Input: "${textBody}"`);
        
        // Validation logic
        const valType = node.data?.validationType || 'any';
        let isValid = true;
        
        if (valType === 'email') {
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textLower);
        } else if (valType === 'number') {
          isValid = !isNaN(Number(textBody));
        } else if (valType === 'phone') {
          isValid = /^\+?[0-9]{7,15}$/.test(textBody.replace(/\s+/g, ''));
        }

        // Allow Skip logic
        const isSkip = node.data?.allowSkip && (textLower === 'saltar' || textLower === 'skip' || textLower === 'omitir');

        if (isValid || isSkip) {
          console.log(`[Bot Engine] Input valid or skipped. Saving variable: ${node.data?.variableName}`);
          
          // Persistence: Save to custom_attributes
          const variableName = node.data?.variableName || `var_${nodeId}`;
          const currentAttributes = contact.custom_attributes || {};
          
          if (!isSkip) {
            currentAttributes[variableName] = textBody;
          }

          await supabase
            .from('contacts')
            .update({ 
               custom_attributes: currentAttributes,
               bot_state: null // Clear state
            })
            .eq('id', organizationConfig.contactId)
            .eq('organization_id', organizationConfig.organizationId);

          // Continue flow
          const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
          if (nextEdge && nextEdge.target) {
            await executeNode(flow, nextEdge.target);
          }
          return;
        } else {
          // Send error message
          const errorMsg = node.data?.errorMessage || 'Ese dato no parece válido. Intenta de nuevo por favor:';
          const res = await waService.sendTextMessage(senderPhone, errorMsg, { jid: contactJid });
          await saveOutgoingMessage('text', errorMsg, res);
          return;
        }
      }
    }

    // Get trigger node configuration
    const triggerNode = (flow.nodes || []).find((n: any) => n.type === 'trigger') || (flow.nodes && flow.nodes[0]);
    const strategy = triggerNode?.data?.matchingStrategy || 'flexible';
    const waitTimeMin = triggerNode?.data?.reactivationTime || 30;

    // REACTIVATION TIMER CHECK
    const { data: lastExec } = await supabase
      .from('flow_executions')
      .select('executed_at')
      .eq('contact_id', organizationConfig.contactId)
      .eq('conversation_id', organizationConfig.conversationId)
      .eq('flow_id', flow.id)
      .order('executed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastExec) {
      const lastExecTime = new Date(lastExec.executed_at).getTime();
      const now = new Date().getTime();
      const diffMin = (now - lastExecTime) / (1000 * 60);
      
      if (diffMin < waitTimeMin) {
        console.log(`[Bot Engine] Blocking reactivation for flow "${flow.name}". User ${senderPhone} last executed ${Math.round(diffMin)}m ago (Threshold: ${waitTimeMin}m)`);
        return; 
      }
    }

    // PRIORITY 1: Check if this is a trigger for starting the flow
    let matchedTrigger: string | null = null;
    
    if (flow.triggers && Array.isArray(flow.triggers) && flow.triggers.length > 0) {
      matchedTrigger = flow.triggers.find((trigger: string) => {
        if (!trigger) return false;
        const triggerLower = trigger.toLowerCase().trim();
        
        if (strategy === 'strict') {
          // Exact match (ignoring only outer spaces)
          return textLower === triggerLower;
        } else {
          // Flexible match (presence in text)
          return textLower.includes(triggerLower);
        }
      }) || null;
    } else {
      // Catch-all
      matchedTrigger = textBody;
    }

    if (matchedTrigger) {
      console.log(`[Bot Engine] Trigger matched (${strategy}): "${matchedTrigger}"`);
      await trackFlowExecution(flow.id, matchedTrigger);
      
      if (triggerNode) {
        await executeNode(flow, triggerNode.id);
        await updateFlowExecution(flow.id, 'completed');
        return;
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
                // Mark as completed when flow finishes naturally
                await updateFlowExecution(flow.id, 'completed');
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
    if (strategy === 'strict') {
      console.log('[Bot Engine] No trigger matched in Strict mode. Staying quiet.');
      return;
    }
    
    console.log('[Bot Engine] No trigger matched. Sending fallback message.');
    const fallbackText = 'No entendí ese comando. Intenta con otras palabras clave configuradas en tus Flujos.';
    const res = await waService.sendTextMessage(senderPhone, fallbackText, { jid: contactJid });
    await saveOutgoingMessage('text', fallbackText, res);
  }

  // Handle Interactive Button replies
  if (message.type === 'interactive') {
    const buttonId = message.interactive.button_reply.id;

    let flow = preloadedFlow;
    if (!flow) {
      if (organizationConfig.whatsappConnectionId) {
        const { data: assignments } = await supabase
          .from('flow_assignments')
          .select(`flows!inner(*)`)
          .eq('whatsapp_connection_id', organizationConfig.whatsappConnectionId)
          .eq('is_active', true);
        if (assignments && assignments.length > 0) flow = assignments[0].flows;
      }
      if (!flow) {
        const { data: fetchedFlow } = await supabase
          .from('flows')
          .select('*')
          .eq('organization_id', organizationConfig.organizationId)
          .eq('is_active', true)
          .order('is_default', { ascending: false })
          .limit(1)
          .maybeSingle();
        flow = fetchedFlow;
      }
    }

    if (flow && flow.edges) {
      const edge = flow.edges.find((e: any) => e.sourceHandle === buttonId || e.source === buttonId);
      if (edge && edge.target) {
        await executeNode(flow, edge.target);
        // Mark as completed when flow finishes naturally
        await updateFlowExecution(flow.id, 'completed');
        return;
      }
    }

    const fallbackText = 'Opción no reconocida o flujo incompleto.';
    const res = await waService.sendTextMessage(senderPhone, fallbackText, { jid: contactJid });
    await saveOutgoingMessage('text', fallbackText, res);
  }
}
