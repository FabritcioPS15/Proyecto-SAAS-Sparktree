import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Camera, CheckCheck, ChevronRight } from 'lucide-react';

interface FlowSimulatorProps {
  nodes: any[];
  edges: any[];
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  buttons?: { id: string; title: string; text?: string }[];
}

export const FlowSimulator: React.FC<FlowSimulatorProps> = ({ nodes, edges, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      text: '¡Hola! Soy el asistente virtual. Escribe una de las palabras clave configuradas para probar el flujo.', 
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForCaptureNodeId, setWaitingForCaptureNodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (node.type === 'text') {
        setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: node.data.text || '', sender: 'bot', timestamp }]);
        
        const nextEdge = edges.find(e => e.source === nodeId);
        if (nextEdge && nextEdge.target) {
          setTimeout(() => executeNode(nextEdge.target), 1500);
        }
      } else if (node.type === 'interactive') {
        setMessages(prev => [
          ...prev, 
          { 
            id: `msg_${Date.now()}`, 
            text: node.data.bodyText || '', 
            sender: 'bot', 
            timestamp,
            buttons: node.data.buttons || [] 
          }
        ]);
      } else if (node.type === 'media') {
        setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: `📎 [Media]: ${node.data.mediaUrl || 'Archivo multimedia'}`, sender: 'bot', timestamp }]);
        const nextEdge = edges.find(e => e.source === nodeId);
        if (nextEdge && nextEdge.target) {
          setTimeout(() => executeNode(nextEdge.target), 1500);
        }
      } else if (node.type === 'capture') {
        setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: node.data.question || 'Por favor ingresa un dato:', sender: 'bot', timestamp }]);
        setWaitingForCaptureNodeId(nodeId);
      } else if (node.type === 'delay') {
        const waitTime = node.data.delaySeconds || 3;
        const nextEdge = edges.find(e => e.source === nodeId);
        if (nextEdge && nextEdge.target) {
          setTimeout(() => executeNode(nextEdge.target), waitTime * 1000);
        }
      } else if (node.type === 'handoff') {
        const handoffMsg = node.data.message || 'Te pondré en contacto con un agente humano. Por favor, espera un momento.';
        setMessages(prev => [...prev, { id: `msg_${Date.now()}`, text: handoffMsg, sender: 'bot', timestamp }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: `sys_${Date.now()}`, 
            text: '🔔 NOTIFICACIÓN: Un agente humano ha sido alertado. La automatización se ha pausado.', 
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }]);
        }, 800);
      }
    }, 1200);
  };

  const handleSendText = (text: string) => {
    if (!text.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: `usr_${Date.now()}`, text, sender: 'user', timestamp }]);
    setInputValue('');

    if (waitingForCaptureNodeId) {
      setTimeout(() => {
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { id: `sys_${Date.now()}`, text: `✅ Dato recibido.`, sender: 'bot', timestamp: ts }]);
        
        const captureNode = nodes.find(n => n.id === waitingForCaptureNodeId);
        setWaitingForCaptureNodeId(null);
        
        if (captureNode) {
          const nextEdge = edges.find((e: any) => e.source === captureNode.id);
          if (nextEdge && nextEdge.target) {
            setTimeout(() => executeNode(nextEdge.target), 800);
          }
        }
      }, 500);
      return;
    }

    const textLower = text.toLowerCase().trim();
    const triggerNode = nodes.find((n: any) => 
      n.type === 'trigger' && 
      n.data?.keywords?.some((k: string) => textLower.includes(k.toLowerCase()))
    );

    if (triggerNode) {
      const firstEdge = edges.find((e: any) => e.source === triggerNode.id);
      if (firstEdge && firstEdge.target) {
        setTimeout(() => executeNode(firstEdge.target), 800);
      }
    } else {
       setTimeout(() => {
          const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages(prev => [...prev, { id: `err_${Date.now()}`, text: 'No reconozco esa palabra clave. Intenta con las configuradas en el flujo.', sender: 'bot', timestamp: ts }]);
       }, 800);
    }
  };

  const handleButtonClick = (button: any) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: `usr_${Date.now()}`, text: button.title || button.text, sender: 'user', timestamp }]);

    const buttonId = button.id;
    const edge = edges.find(e => e.sourceHandle === buttonId || e.source === buttonId);
    
    if (edge && edge.target) {
      setTimeout(() => executeNode(edge.target), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[100001] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-[400px] h-[85vh] min-h-[600px] bg-white dark:bg-[#111b21] rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-[12px] border-[#202c33] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Notch Area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-[#202c33] rounded-b-3xl z-[60] flex items-center justify-center gap-4">
          <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-white/5" />
          <div className="w-16 h-1.5 bg-slate-800 rounded-full border border-white/5" />
        </div>

        {/* WhatsApp Header */}
        <div className="bg-[#202c33] text-white pt-12 pb-5 px-6 flex items-center justify-between shadow-lg z-50">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 group">
              <ChevronRight className="w-5 h-5 rotate-180 text-white/70 group-hover:text-white" />
              <div className="w-9 h-9 bg-slate-400 rounded-full overflow-hidden border border-slate-600">
                 <img src="https://ui-avatars.com/api/?name=IA&background=00a884&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </button>
            <div>
              <h3 className="font-bold text-[15px] tracking-tight leading-none mb-1">Simulador AI</h3>
              <p className="text-[10px] text-[#00a884] font-black uppercase tracking-wider">
                {isTyping ? 'escribiendo...' : 'en línea'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <Video className="w-5 h-5 cursor-not-allowed hidden sm:block" />
            <Phone className="w-4.5 h-4.5 cursor-not-allowed hidden sm:block" />
            <MoreVertical className="w-5 h-5 cursor-not-allowed" />
          </div>
        </div>

        {/* Chat Area with Wallpaper */}
        <div 
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[#0b141a] relative"
          style={{ 
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            backgroundBlendMode: 'overlay',
            backgroundSize: '400px',
            backgroundColor: '#0b141a'
          }}
        >
          {/* Day Label */}
          <div className="self-center px-4 py-1.5 bg-[#182229] rounded-xl shadow-sm mb-6 mt-2 border border-white/5">
            <span className="text-[10px] text-white/60 font-black uppercase tracking-[0.15em]">Hoy</span>
          </div>

          <div className="flex flex-col gap-2 relative z-10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : (msg.sender === 'system' ? 'self-center w-full max-w-none' : 'self-start')}`}>
                
                {msg.sender === 'system' ? (
                  <div className="px-5 py-2.5 bg-[#182229] rounded-2xl border border-indigo-500/30 text-[10px] text-indigo-400 font-bold uppercase tracking-widest text-center my-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-lg shadow-indigo-500/10">
                    {msg.text}
                  </div>
                ) : (
                  <div 
                    className={`px-4 py-2.5 rounded-2xl shadow-sm relative text-[14px] ${
                      msg.sender === 'user' 
                        ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                        : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                    }`}
                  >
                    <div className={`absolute top-0 w-3 h-3 ${
                      msg.sender === 'user' 
                        ? 'right-[-8px] border-l-[10px] border-l-[#005c4b] border-b-[10px] border-b-transparent' 
                        : 'left-[-8px] border-r-[10px] border-r-[#202c33] border-b-[10px] border-b-transparent'
                    }`} />
                    
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/40 leading-none">{msg.timestamp}</span>
                      {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                    </div>
                  </div>
                )}
                
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 w-full">
                    {msg.buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleButtonClick(btn)}
                        className="bg-[#202c33] border border-white/10 hover:bg-[#2a3942] text-[#53bdeb] text-[13px] font-bold py-3 px-6 rounded-full shadow-lg transition-all active:scale-95 text-center"
                      >
                        {btn.title || btn.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
                <div className="self-start bg-[#202c33] px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-[#0b141a] p-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 bg-[#2a3942] rounded-full px-4 py-2.5 border border-white/5">
            <Smile className="w-6 h-6 text-white/40 cursor-pointer hover:text-white/70 transition-colors" />
            <input 
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-[#e9edef] text-[15px] placeholder-white/20"
              placeholder="Mensaje"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendText(inputValue);
              }}
            />
            <Paperclip className="w-5 h-5 text-white/40 -rotate-45 cursor-pointer hover:text-white/70 transition-colors" />
            {!inputValue && <Camera className="w-5 h-5 text-white/40 cursor-pointer hover:text-white/70 transition-colors shadow-none" />}
          </div>
          
          <button 
            onClick={() => handleSendText(inputValue)}
            className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all hover:brightness-110 shrink-0"
          >
            {inputValue ? <Send className="w-5 h-5 ml-1" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        {/* Home Indicator Overlay */}
        <div className="bg-[#0b141a] pb-3 flex justify-center">
          <div className="w-32 h-1.5 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};
