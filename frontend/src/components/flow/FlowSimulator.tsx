import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Check, CheckCheck, Clock } from 'lucide-react';

interface FlowSimulatorProps {
  nodes: any[];
  edges: any[];
  onClose: () => void;
  botMode?: 'triggers_only' | 'general_response';
  fallbackMessage?: string;
  triggers?: string[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  buttons?: { id: string; title: string }[];
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export const FlowSimulator: React.FC<FlowSimulatorProps> = ({ nodes, edges, onClose, botMode = 'general_response', fallbackMessage = 'Lo siento, no entiendo tu mensaje. ¿En qué puedo ayudarte?', triggers = [] }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      text: botMode === 'triggers_only' 
        ? `🤖 MODO: SOLO TRIGGERS 🔒\n\nTriggers configurados: ${triggers.length > 0 ? triggers.join(', ') : 'Ninguno'}\n\n⚠️ El bot SOLO responderá si escribes EXACTAMENTE una palabra clave.\n\n✅ FUNCIONA:\n• "hola"\n• "buenos días"\n• "¡Hola! Quiero más información del material publicitario"\n\n❌ NO FUNCIONA:\n• "hola hijo"\n• "ayuda por favor"\n• "hola ¿cómo estás?"\n\nSi no es trigger EXACTO, el bot se quedará en silencio.` 
        : '🤖 MODO: RESPUESTA GENERAL 💬\n\nEl bot responderá a CUALQUIER mensaje.\nSi no hay trigger exacto, enviará mensaje de ayuda.\n\nTriggers exactos: ' + (triggers.length > 0 ? triggers.join(', ') : 'Ninguno'), 
      sender: 'bot', 
      timestamp: new Date(), 
      status: 'read' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [waitingForCaptureNodeId, setWaitingForCaptureNodeId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update message status progressively
  const updateMessageStatus = (messageId: string) => {
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
    }, 300);
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'delivered' } : msg
      ));
    }, 800);
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
    }, 1500);
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffMins < 1440) return `hace ${Math.floor(diffMins / 60)} h`;
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const executeNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Show typing indicator
    setIsTyping(true);
    
    // Random delay for typing (1-3 seconds)
    const typingDelay = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (node.type === 'text') {
        const messageId = `msg_${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: messageId, 
          text: node.data.text || '', 
          sender: 'bot',
          timestamp: new Date(),
          status: 'sending'
        }]);
        updateMessageStatus(messageId);
        
        // Auto-trigger next node if connected directly
        const nextEdge = edges.find(e => e.source === nodeId);
        if (nextEdge && nextEdge.target) {
          setTimeout(() => executeNode(nextEdge.target), 800 + Math.random() * 1200);
        }
      } else if (node.type === 'interactive') {
        const messageId = `msg_${Date.now()}`;
        setMessages(prev => [
          ...prev, 
          { 
            id: messageId, 
            text: node.data.bodyText || '', 
            sender: 'bot', 
            buttons: node.data.buttons || [],
            timestamp: new Date(),
            status: 'sending'
          }
        ]);
        updateMessageStatus(messageId);
      } else if (node.type === 'media') {
        const messageId = `msg_${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: messageId, 
          text: `[📎 Multimedia: ${node.data.mediaUrl || 'Sin URL'}]`, 
          sender: 'bot',
          timestamp: new Date(),
          status: 'sending'
        }]);
        updateMessageStatus(messageId);
        const nextEdge = edges.find(e => e.source === nodeId);
        if (nextEdge && nextEdge.target) {
          setTimeout(() => executeNode(nextEdge.target), 800 + Math.random() * 1200);
        }
      } else if (node.type === 'capture') {
        const messageId = `msg_${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: messageId, 
          text: node.data.question || '?', 
          sender: 'bot',
          timestamp: new Date(),
          status: 'sending'
        }]);
        updateMessageStatus(messageId);
        setWaitingForCaptureNodeId(nodeId);
      } else if (node.type === 'webhook') {
        const messageId = `msg_${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: messageId, 
          text: `[📡 Webhook Ejecutado: ${node.data.method || 'POST'} ${node.data.url || 'Sin URL'}]`, 
          sender: 'bot',
          timestamp: new Date(),
          status: 'sending'
        }]);
        updateMessageStatus(messageId);
        const nextEdge = edges.find(e => e.source === nodeId);
        if (nextEdge && nextEdge.target) {
          setTimeout(() => executeNode(nextEdge.target), 800 + Math.random() * 1200);
        }
      } else if (node.type === 'handoff') {
        const messageId = `msg_${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: messageId, 
          text: '[👩‍💻 Conversación pausada / Transferida a agente humano]', 
          sender: 'bot',
          timestamp: new Date(),
          status: 'sending'
        }]);
        updateMessageStatus(messageId);
      } else if (node.type === 'delay') {
        const waitTime = (node.data.delaySeconds || 3) * 1000;
        
        // Check if invisible message
        if (!node.data.invisibleMessage) {
          const messageId = `msg_${Date.now()}`;
          setMessages(prev => [...prev, { 
            id: messageId, 
            text: `[⏳ Esperando ${waitTime/1000}s...]`, 
            sender: 'bot',
            timestamp: new Date(),
            status: 'sending'
          }]);
          updateMessageStatus(messageId);
        }
        
        setTimeout(() => {
          // Auto message if configured
          if (node.data.autoMessage) {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              const autoMessageId = `msg_${Date.now()}`;
              setMessages(prev => [...prev, { 
                id: autoMessageId, 
                text: node.data.autoMessage, 
                sender: 'bot',
                timestamp: new Date(),
                status: 'sending'
              }]);
              updateMessageStatus(autoMessageId);
            }, 1000 + Math.random() * 2000);
          }
          
          const nextEdge = edges.find(e => e.source === nodeId);
          if (nextEdge && nextEdge.target) {
            setTimeout(() => executeNode(nextEdge.target), 800 + Math.random() * 1200);
          }
        }, waitTime);
      }
    }, typingDelay);
  };

  const handleSendText = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessageId = `usr_${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: userMessageId, 
      text, 
      sender: 'user',
      timestamp: new Date(),
      status: 'sending' as const
    }]);
    updateMessageStatus(userMessageId);
    setInputValue('');

    if (waitingForCaptureNodeId) {
      setTimeout(() => {
        const sysMessageId = `sys_${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: sysMessageId, 
          text: '[💾 Dato guardado exitosamente]', 
          sender: 'bot',
          timestamp: new Date(),
          status: 'sending' as const
        }]);
        updateMessageStatus(sysMessageId);
        
        const captureNode = nodes.find(n => n.id === waitingForCaptureNodeId);
        setWaitingForCaptureNodeId(null);
        
        if (captureNode) {
          const nextEdge = edges.find((e: any) => e.source === captureNode.id);
          if (nextEdge && nextEdge.target) {
            setTimeout(() => executeNode(nextEdge.target), 600);
          }
        }
      }, 500);
      return;
    }

    // Check for trigger using both node triggers and global triggers (TRUE EXACT MATCH)
    const nodeTrigger = nodes.find((n: any) => 
      n.type === 'trigger' && 
      n.data?.keywords?.some((k: string) => {
        const triggerLower = k.toLowerCase().trim();
        const textLowerTrimmed = text.toLowerCase().trim();
        // TRUE EXACT MATCH: the message must be EXACTLY the trigger, nothing else
        return textLowerTrimmed === triggerLower;
      })
    );
    
    const globalTrigger = triggers.some((trigger: string) => {
      const triggerLower = trigger.toLowerCase().trim();
      const textLowerTrimmed = text.toLowerCase().trim();
      // TRUE EXACT MATCH: the message must be EXACTLY the trigger, nothing else
      return textLowerTrimmed === triggerLower;
    });

    const hasTrigger = nodeTrigger || globalTrigger;

    // Bot mode logic
    if (botMode === 'triggers_only') {
      // Solo Triggers mode: ONLY respond if there's a trigger
      if (hasTrigger) {
        // Execute the trigger
        const triggerToUse = nodeTrigger || { id: 'global-trigger' };
        const firstEdge = edges.find((e: any) => e.source === triggerToUse.id);
        if (firstEdge && firstEdge.target) {
          setTimeout(() => executeNode(firstEdge.target), 600);
        }
      }
      // IF NO TRIGGER - BOT STAYS SILENT (no response at all)
    } else {
      // General Response mode: always respond
      if (hasTrigger) {
        // Execute the trigger
        const triggerToUse = nodeTrigger || { id: 'global-trigger' };
        const firstEdge = edges.find((e: any) => e.source === triggerToUse.id);
        if (firstEdge && firstEdge.target) {
          setTimeout(() => executeNode(firstEdge.target), 600);
        }
      } else {
        // No trigger - send fallback message
        setTimeout(() => {
          const messageId = `fallback_${Date.now()}`;
          setMessages(prev => [...prev, { 
            id: messageId, 
            text: fallbackMessage, 
            sender: 'bot',
            timestamp: new Date(),
            status: 'sending' as const
          }]);
          updateMessageStatus(messageId);
        }, 600);
      }
    }
  };

  const handleButtonClick = (buttonId: string, buttonTitle: string) => {
    setMessages(prev => [...prev, { 
      id: `usr_${Date.now()}`, 
      text: buttonTitle, 
      sender: 'user',
      timestamp: new Date(),
      status: 'sending' as const
    }]);
    updateMessageStatus(`usr_${Date.now()}`);

    // Find edge from this button
    const edge = edges.find(e => e.sourceHandle === buttonId || e.source === buttonId); // Simple check if sourceHandle is used, or fallback
    
    if (edge && edge.target) {
      setTimeout(() => executeNode(edge.target), 600);
    } else {
      setTimeout(() => {
          const messageId = `err_${Date.now()}`;
          setMessages(prev => [...prev, { 
            id: messageId, 
            text: 'Opción no conectada a ningún nodo.', 
            sender: 'bot',
            timestamp: new Date(),
            status: 'sending' as const
          }]);
          updateMessageStatus(messageId);
       }, 600);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[600px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Simulador de Flujo</h3>
            <p className="text-xs text-white/80">en línea</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Background */}
      <div className="flex-1 bg-[#efeae2] dark:bg-gray-800 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
         <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-0"></div>
         <div className="relative z-10 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl shadow-sm relative ${msg.sender === 'user' ? 'bg-[#dcf8c6] dark:bg-emerald-900 text-gray-900 dark:text-gray-100 rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'}`}>
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block text-right mt-1.5 opacity-80">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                  {/* Message Status */}
                  <div className="flex items-center gap-1 mt-1">
                    {msg.sender === 'user' && (
                      <>
                        {msg.status === 'sending' && <Clock className="w-3 h-3 text-gray-400" />}
                        {msg.status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
                        {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Interactive Buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    {msg.buttons.map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleButtonClick(btn.id, btn.title)}
                        className={`w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium shadow-sm transition-colors ${msg.sender === 'user' ? 'bg-[#dcf8c6]/80 text-emerald-800' : 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-100 dark:bg-gray-700 dark:text-primary-400 dark:border-gray-600'}`}
                      >
                        {btn.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col max-w-[85%] self-start">
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
         </div>
      </div>

      {/* Message Input */}
      <div className="p-3 bg-[#f0f0f0] dark:bg-gray-900 flex items-center gap-2">
        <input 
          type="text"
          className="flex-1 bg-white dark:bg-gray-800 border-none rounded-full px-4 py-2.5 text-sm focus:ring-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-sm"
          placeholder="Escribe un mensaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendText(inputValue);
          }}
        />
        <button 
          onClick={() => handleSendText(inputValue)}
          className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-colors"
        >
          <Send className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
