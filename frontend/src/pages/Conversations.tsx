import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversations, getConversationMessages, deleteConversation, deleteUser } from '../services/api';
import api from '../services/api';
import { 
  Check, Send, Search, Filter, Users, MoreVertical, 
  Smile, Paperclip, Mic, Star, Volume2, MessageCircle, 
  Trash2, ChevronLeft, ChevronRight, MoreHorizontal 
} from 'lucide-react';

import { PageLoader } from '../components/layout/PageLoader';

export const Conversations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessagesLength = useRef(0);

  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      if (messages.length > lastMessagesLength.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      lastMessagesLength.current = messages.length;
    }
  }, [messages]);

  useEffect(() => {
    lastMessagesLength.current = 0;
  }, [selectedConv]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations();
        const conversationsArray = Array.isArray(data) ? data : [];

        let filtered = conversationsArray;
        if (searchTerm) {
          filtered = filtered.filter(conv =>
            (conv.contactId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (conv.contactId?.phoneNumber || '').includes(searchTerm)
          );
        }

        if (filterStatus !== 'all') {
          filtered = filtered.filter(conv => {
            if (filterStatus === 'unread') return conv.unreadCount > 0;
            if (filterStatus === 'groups') return conv.contactId?.isGroup === true;
            return true;
          });
        }

        setConversations(filtered);
      } catch (err) {
        console.error('Failed to load conversations', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    if (id && conversations.length > 0 && (!selectedConv || selectedConv._id !== id)) {
      const conv = conversations.find(c => c._id === id);
      if (conv) {
        setSelectedConv(conv);
      }
    }
  }, [id, conversations]);

  const totalPages = Math.ceil(conversations.length / itemsPerPage);
  const paginatedConversations = conversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (selectedConv) {
      const loadMessages = async () => {
        try {
          const data = await getConversationMessages(selectedConv._id);
          setMessages(data);
        } catch (err) {
          console.error('Failed to load messages', err);
        }
      };
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConv || sending) return;
    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    const optimistic = {
      _id: `tmp-${Date.now()}`,
      direction: 'outbound',
      content: text,
      createdAt: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const response = await api.post(`/conversations/${selectedConv._id}/send`, { text });
      setMessages(prev => prev.map(m => m._id === optimistic._id ? response.data : m));
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string, contactId?: string) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar conversación y el cliente asociado?')) {
      try {
        await deleteConversation(conversationId);
        if (contactId) {
          await deleteUser(contactId);
        }
        setConversations(prev => prev.filter(c => c._id !== conversationId));
        if (selectedConv?._id === conversationId) setSelectedConv(null);
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Error al eliminar. Inténtelo de nuevo.');
      }
    }
  };

  const parseMessage = (content: any): string => {
    if (!content) return '';
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      const body = parsed.body || 
                   parsed.text?.body || 
                   parsed.text ||
                   parsed.conversation ||
                   parsed.extendedTextMessage?.text ||
                   parsed.interactive?.button_reply?.title ||
                   parsed.interactive?.list_reply?.title ||
                   parsed.message?.conversation ||
                   parsed.message?.extendedTextMessage?.text;

      if (body) return body;
      if (parsed.type === 'media' || parsed.media || parsed.imageMessage || parsed.videoMessage) {
        return '📷 Archivo multimedia';
      }
      return typeof content === 'string' ? content : 'Mensaje';
    } catch {
      return typeof content === 'string' ? content : 'Mensaje';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0 && date.getDate() === now.getDate()) {
      return timeStr;
    } else if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
      return `Ayer ${timeStr}`;
    } else if (diffDays < 7) {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${days[date.getDay()]} ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${timeStr}`;
    }
  };

  const generateAvatar = (contact: any) => {
    const isGroup = contact?.isGroup;
    const name = contact?.name || 'U';
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = isGroup ? 'bg-indigo-600' : 'bg-slate-500';
    return { content: firstLetter, bgColor: colors, isGroup };
  };

  if (loading) return <PageLoader sectionName="Conversaciones" />;

  return (
    <div className="flex-1 flex bg-[#f7f9fc] dark:bg-[#0b0c10] overflow-hidden antialiased h-full">

      {/* --- SIDEBAR: Chat List --- */}
      <div className="w-[340px] lg:w-[380px] h-full flex flex-col bg-white dark:bg-[#11141b] border-r border-gray-100 dark:border-white/5 z-20 shadow-2xl relative transition-all duration-500">
        
        {/* Sidebar Header */}
        <div className="pt-6 px-5 pb-3">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Conversaciones</h1>
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-accent-500 hover:bg-accent-500/10 rounded-xl transition-all">
                <Users className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => { setIsFilterOpen(!isFilterOpen); setIsMenuOpen(false); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isFilterOpen ? 'text-accent-500 bg-accent-500/10' : 'text-gray-400 hover:text-accent-500 hover:bg-accent-500/10'}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1c212b] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                     {[
                      { id: 'all', label: 'Todos', icon: MessageCircle },
                      { id: 'unread', label: 'No leídos', icon: Star },
                      { id: 'groups', label: 'Grupos', icon: Users }
                    ].map(f => (
                      <button 
                        key={f.id}
                        onClick={() => { setFilterStatus(f.id); setIsFilterOpen(false); setCurrentPage(1); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === f.id ? 'text-accent-500 bg-accent-500/5' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => { setIsMenuOpen(!isMenuOpen); setIsFilterOpen(false); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isMenuOpen ? 'text-accent-500 bg-accent-500/10' : 'text-gray-400 hover:text-accent-500 hover:bg-accent-500/10'}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1c212b] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Nueva difusión</button>
                    <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Configuración</button>
                    <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2" />
                    <button onClick={() => window.location.reload()} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">Recargar</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group mb-5">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full h-11 pl-11 pr-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent-500/20 rounded-xl outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>
        </div>

        {/* Chat Items List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 custom-scrollbar">
          {paginatedConversations.map((conv) => {
            const isSelected = selectedConv?._id === conv._id;
            const contact = conv.contactId || {};
            const avatar = generateAvatar(contact);

            return (
              <div
                key={conv._id}
                onClick={() => {
                  if (selectedConv?._id !== conv._id) {
                    setMessages([]);
                    setMessageText('');
                    navigate(`/conversations/${conv._id}`);
                  }
                }}
                className={`flex items-start gap-3 p-3.5 cursor-pointer rounded-2xl transition-all duration-300 relative group border ${
                  isSelected 
                    ? 'bg-white dark:bg-[#1c212b] border-accent-500/10 shadow-lg scale-[1.01] z-10' 
                    : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {/* Active Indicator */}
                {isSelected && (
                  <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-500 rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                )}

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm ${avatar.bgColor}`}>
                    {avatar.isGroup ? <Users className="w-5 h-5" /> : avatar.content}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#11141b] rounded-full" />
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 dark:text-gray-100 truncate text-[13px] tracking-tight">
                      {contact.name || contact.phoneNumber}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className={`text-[12px] truncate w-full pr-4 ${isSelected ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {parseMessage(conv.lastMessageContent) || 'Sin mensajes'}
                    </p>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="bg-accent-500 text-black text-[9px] font-black h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                      
                      <button 
                        onClick={(e) => handleDeleteConversation(e, conv._id, conv.contactId?._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Control */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Pág {currentPage} / {totalPages}
             </div>
             <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-400 hover:text-accent-500 disabled:opacity-10 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-400 hover:text-accent-500 disabled:opacity-10 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* --- MAIN PANE --- */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#f7f9fc] dark:bg-[#0b0c10] overflow-hidden h-full relative">
        
        {/* Modern Top Info Bar */}
        <div className="pt-5 px-8 pb-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-emerald-500/5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse focus:ring-4 focus:ring-emerald-500/20" />
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Conectado</span>
            </div>
            <p className="text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-widest">Sparktree Engine</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white dark:bg-white/5 rounded-xl text-gray-400 hover:text-accent-500 shadow-sm border border-gray-100 dark:border-white/5 transition-all">
              <Volume2 className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-accent-500 text-white dark:text-black flex items-center justify-center font-black text-xs shadow-md">
               SA
            </div>
          </div>
        </div>

        {selectedConv ? (
          <>
            {/* Conversation Header Card */}
            <div className="px-8 py-4">
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${generateAvatar(selectedConv.contactId).bgColor}`}>
                    {selectedConv.contactId?.isGroup ? <Users className="w-7 h-7" /> : generateAvatar(selectedConv.contactId).content}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        {selectedConv.contactId?.name || selectedConv.contactId?.phoneNumber}
                      </h3>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedConv.contactId?.phoneNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="p-3 text-gray-400 hover:text-accent-500 hover:bg-accent-500/5 rounded-xl transition-all">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-gray-400 hover:text-accent-500 hover:bg-accent-500/5 rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-8 pb-4 space-y-4 custom-scrollbar relative z-10"
            >
              {messages.map((m) => {
                const isMe = m.direction === 'outbound';
                const body = parseMessage(m.content);
                if (!body && m.direction === 'inbound') return null;

                return (
                  <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1.5 ml-4">
                        <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <Users className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contacto</span>
                      </div>
                    )}
                    <div className={`relative max-w-[80%] lg:max-w-[60%] px-5 py-3 rounded-2xl shadow-sm transition-all ${
                      isMe
                        ? 'bg-gradient-to-br from-accent-400 to-accent-600 text-white dark:text-black rounded-tr-none'
                        : 'bg-white dark:bg-[#1c212b] text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-white/5'
                      }`}>
                      <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap tracking-wide">{body}</p>
                      <div className={`flex justify-end items-center gap-1.5 mt-2 ${isMe ? 'text-white/70 dark:text-black/60' : 'text-gray-400 dark:text-gray-500'}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {formatTime(m.createdAt)}
                        </span>
                        {isMe && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Footer Area */}
            <div className="px-8 pb-8 pt-2 z-20">
              <div className="bg-white dark:bg-[#1c212b] rounded-[1.5rem] p-2 pl-6 shadow-xl border border-gray-100 dark:border-white/5 flex items-center gap-4 transition-all focus-within:ring-4 focus-within:ring-accent-500/5 group border-b-2 border-accent-500/10">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Responder..."
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-bold text-base"
                />
                <div className="flex items-center gap-1">
                   <button className="p-2 text-gray-400 hover:text-accent-500 transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                   <button className="p-2 text-gray-400 hover:text-accent-500 transition-all">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
                      messageText.trim() 
                        ? 'bg-black dark:bg-accent-500 text-white dark:text-black shadow-lg shadow-accent-500/20 scale-105' 
                        : 'bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Send className={messageText.trim() ? "w-5 h-5" : "w-4 h-4"} />
                  </button>
                  <div className="w-[1px] h-6 bg-gray-100 dark:bg-white/5 mx-1" />
                  <button className="p-2 text-gray-400 hover:text-accent-500 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 select-none animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-60 h-60 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl relative transform -rotate-2 hover:rotate-0 transition-transform duration-700">
               <div className="absolute inset-0 bg-accent-500/10 blur-[60px] rounded-full" />
               <MessageCircle className="w-24 h-24 text-accent-500 z-10 animate-pulse-slow" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Sparktree Messaging</h2>
            <p className="max-w-sm text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-10 px-6">
              Gestiona todas tus interacciones de WhatsApp desde una interfaz centralizada y moderna.
            </p>
            <div className="flex items-center gap-3 bg-black dark:bg-accent-500 px-6 py-2.5 rounded-2xl text-white dark:text-black shadow-lg transition-all active:scale-95 cursor-pointer">
              <Check className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cifrado Activo</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
        }
        .animate-pulse-slow {
          animation: pulse 4s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
};
