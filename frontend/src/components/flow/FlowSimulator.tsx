import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Bot } from 'lucide-react';

interface FlowSimulatorProps {
  nodes: any[];
  edges: any[];
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  buttons?: { id: string; title: string }[];
}

export const FlowSimulator: React.FC<FlowSimulatorProps> = ({ nodes, edges, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: 'Escribe una palabra clave para iniciar el flujo (ej: hola).', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [waitingForCaptureNodeId, setWaitingForCaptureNodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.type === 'text') {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: node.data.text || '', sender: 'bot' }]);
      
      // Auto-trigger next node if connected directly
      const nextEdge = edges.find(e => e.source === nodeId);
      if (nextEdge && nextEdge.target) {
        setTimeout(() => executeNode(nextEdge.target), 1000);
      }
    } else if (node.type === 'interactive') {
      setMessages(prev => [
        ...prev, 
        { 
          id: `msg_${Date.now()}`, 
          text: node.data.bodyText || '', 
          sender: 'bot', 
          buttons: node.data.buttons || [] 
        }
      ]);
    } else if (node.type === 'media') {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: `[Multimedia: ${node.data.mediaUrl || 'Sin URL'}]`, sender: 'bot' }]);
      const nextEdge = edges.find(e => e.source === nodeId);
      if (nextEdge && nextEdge.target) {
        setTimeout(() => executeNode(nextEdge.target), 1000);
      }
    } else if (node.type === 'capture') {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: node.data.question || '?', sender: 'bot' }]);
      setWaitingForCaptureNodeId(nodeId);
    } else if (node.type === 'webhook') {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: `[📡 Webhook Ejecutado: ${node.data.method || 'POST'} ${node.data.url || 'Sin URL'}]`, sender: 'bot' }]);
      const nextEdge = edges.find(e => e.source === nodeId);
      if (nextEdge && nextEdge.target) {
        setTimeout(() => executeNode(nextEdge.target), 1000);
      }
    } else if (node.type === 'handoff') {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: '[👩‍💻 Conversación pausada / Transferida a agente humano]', sender: 'bot' }]);
    } else if (node.type === 'delay') {
      const waitTime = node.data.delaySeconds || 3;
      setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: `[⏳ Esperando ${waitTime}s...]`, sender: 'bot' }]);
      const nextEdge = edges.find(e => e.source === nodeId);
      if (nextEdge && nextEdge.target) {
        setTimeout(() => executeNode(nextEdge.target), waitTime * 1000);
      }
    }
  };

  const handleSendText = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { id: `usr_${Date.now()}`, text, sender: 'user' }]);
    setInputValue('');

    if (waitingForCaptureNodeId) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: `sys_${Date.now()}`, text: `[💾 Dato guardado exitosamente]`, sender: 'bot' }]);
        
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

    const textLower = text.toLowerCase().trim();

    // Check for trigger
    const triggerNode = nodes.find((n: any) => 
      n.type === 'trigger' && 
      n.data?.keywords?.some((k: string) => textLower.includes(k.toLowerCase()))
    );

    if (triggerNode) {
      const firstEdge = edges.find((e: any) => e.source === triggerNode.id);
      if (firstEdge && firstEdge.target) {
        setTimeout(() => executeNode(firstEdge.target), 600);
      }
    } else {
       setTimeout(() => {
          setMessages(prev => [...prev, { id: `err_${Date.now()}`, text: 'No entendí ese comando (Palabra clave no encontrada en el flujo actual).', sender: 'bot' }]);
       }, 600);
    }
  };

  const handleButtonClick = (buttonId: string, buttonTitle: string) => {
    setMessages(prev => [...prev, { id: `usr_${Date.now()}`, text: buttonTitle, sender: 'user' }]);

    // Find edge from this button
    const edge = edges.find(e => e.sourceHandle === buttonId || e.source === buttonId); // Simple check if sourceHandle is used, or fallback
    
    if (edge && edge.target) {
      setTimeout(() => executeNode(edge.target), 600);
    } else {
      setTimeout(() => {
          setMessages(prev => [...prev, { id: `err_${Date.now()}`, text: 'Opción no conectada a ningún nodo.', sender: 'bot' }]);
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
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block text-right mt-1.5 opacity-80">ahora</span>
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
