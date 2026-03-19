import { useState, useEffect, useRef } from 'react';
import { getConversations, getConversationMessages, deleteConversation } from '../services/api';
import api from '../services/api';
import { Check, TrendingUp, Trash2, Send, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

export const Conversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const ITEMS_PER_PAGE = 15;

  // Function to generate avatar based on contact name
  const generateAvatar = (contact: any) => {
    const name = contact?.name || '';
    const phoneNumber = contact?.phoneNumber || '';
    
    // If we have a name, use first letter
    if (name) {
      const firstLetter = name.charAt(0).toUpperCase();
      const colors = [
        'bg-primary-500', 'bg-accent-500', 'bg-secondary-500', 'bg-blueaccent-500',
        'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'
      ];
      const colorIndex = name.charCodeAt(0) % colors.length;
      return {
        type: 'letter',
        content: firstLetter,
        bgColor: colors[colorIndex]
      };
    }
    
    // If we have phone number, use last 2 digits as fallback
    if (phoneNumber && phoneNumber.length >= 2) {
      const lastTwo = phoneNumber.slice(-2);
      return {
        type: 'number',
        content: lastTwo,
        bgColor: 'bg-slate-600'
      };
    }
    
    // Default fallback
    return {
      type: 'default',
      content: '??',
      bgColor: 'bg-slate-400'
    };
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations();
        // Ensure we always have an array
        const conversationsArray = Array.isArray(data) ? data : [];
        
        // Apply filters
        let filteredConversations = conversationsArray;
        if (searchTerm) {
          filteredConversations = filteredConversations.filter(conv => 
            (conv.contactId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (conv.contactId?.phoneNumber || '').includes(searchTerm)
          );
        }
        
        if (filterStatus !== 'all') {
          filteredConversations = filteredConversations.filter(conv => {
            if (filterStatus === 'unread') return conv.unreadCount > 0;
            if (filterStatus === 'read') return conv.unreadCount === 0;
            return true;
          });
        }
        
        // Calculate pagination
        const total = filteredConversations.length;
        const pages = Math.ceil(total / ITEMS_PER_PAGE);
        setTotalPages(pages);
        
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedConversations = filteredConversations.slice(startIndex, endIndex);
        
        setConversations(paginatedConversations);
        
        if (paginatedConversations.length > 0 && !selectedConv) {
          setSelectedConv(paginatedConversations[0]);
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
        setConversations([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadConversations();

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(loadConversations, 5000);

    return () => clearInterval(interval);
  }, [selectedConv, currentPage, searchTerm, filterStatus]);

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

      // Initial load
      loadMessages();

      // Set up polling for real-time message updates (every 3 seconds)
      const interval = setInterval(loadMessages, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar esta conversación?')) {
      try {
        await deleteConversation(id);
        setConversations(prev => prev.filter(c => c._id !== id));
        if (selectedConv?._id === id) {
          setSelectedConv(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error deleting conversation', err);
        alert('No se pudo eliminar la conversación');
      }
    }
  };

  // Auto-scroll on new messages — scroll only within the messages container, NOT the page
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConv || sending) return;
    setSendError(null);
    setSending(true);
    const text = messageText.trim();
    setMessageText('');

    // Optimistic update — show message immediately
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
      // Replace optimistic message with the real saved one
      setMessages(prev => prev.map(m => m._id === optimistic._id ? { ...response.data, _id: response.data._id || optimistic._id } : m));
    } catch (err: any) {
      setSendError(err?.response?.data?.error || 'Error al enviar el mensaje');
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format for common international lengths
    // 11 digits (like Peru +51 + 9 digits)
    if (cleanPhone.length === 11) {
      if (cleanPhone.startsWith('51')) {
        return `+51 ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5, 8)} ${cleanPhone.substring(8)}`;
      }
      return `+${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5, 8)} ${cleanPhone.substring(8)}`;
    }
    
    // 12 digits (variants with longer country codes)
    if (cleanPhone.length === 12) {
      return `+${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 9)} ${cleanPhone.substring(9)}`;
    }

    // 9 digits (assumed Peruvian without country code)
    if (cleanPhone.length === 9) {
      return `+51 ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    }
    
    // Generic fallback for any other length
    if (cleanPhone.length > 5) {
      return `+${cleanPhone}`;
    }
    
    return phone;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <PageLoader sectionName="Conversaciones" />;
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <PageBody scrollable={false} className="h-full py-0">
        <div className="flex-1 flex h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-slate-50/50 dark:bg-transparent">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent sticky top-0 z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chats</h2>
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-black rounded-full border border-primary-100 dark:border-primary-500/20">
                    {conversations.length} total
                  </span>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar contactos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="flex justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      filterStatus === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterStatus('unread')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      filterStatus === 'unread'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    No leídos
                  </button>
                  <button
                    onClick={() => setFilterStatus('read')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      filterStatus === 'read'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    Leídos
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <div className="p-10 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center animate-pulse">
                <p className="text-slate-400 text-sm font-medium">No hay conversaciones activas</p>
              </div>
            ) : (
              conversations.map((conv, idx) => {
                const contact = conv.contactId || {};
                const isSelected = selectedConv?._id === conv._id;
                const avatar = generateAvatar(contact);
                return (
                  <div
                    key={conv._id || conv.id || `conv-${idx}`}
                    onClick={() => setSelectedConv(conv)}
                    role="button"
                    tabIndex={0}
                    className={`w-full p-5 text-left transition-all duration-300 relative group cursor-pointer outline-none ${isSelected
                      ? 'bg-white dark:bg-slate-800/40'
                      : 'hover:bg-white/50 dark:hover:bg-slate-800/20'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary-600 dark:bg-primary-500 rounded-r-full shadow-lg shadow-primary-600/20" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 ${isSelected
                        ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-xl shadow-primary-600/20 ring-2 ring-primary-600/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:scale-105 group-hover:-rotate-3'
                        }`}>
                        {avatar.type === 'letter' ? (
                          <span className="text-white">{avatar.content}</span>
                        ) : (
                          <span className="text-white font-mono">{avatar.content}</span>
                        )}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                            {contact.name || 'Usuario Anon'}
                          </p>
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {formatDate(conv.lastMessageAt)}
                          </span>
                        </div>
                        {contact.phoneNumber && (
                          <p className={`text-xs text-slate-500 dark:text-slate-400 truncate font-medium mb-2`}>
                            {formatPhoneNumber(contact.phoneNumber)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className={`text-xs text-slate-400 dark:text-slate-500 truncate font-medium`}>
                            {formatTime(conv.lastMessageAt)}
                          </p>
                          <div className="flex items-center gap-2">
                            {conv.unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-secondary-500 text-white text-[10px] font-black rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteConversation(e, conv._id)}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-secondary-50 dark:hover:bg-secondary-500/10 text-secondary-500 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Pagination */}
            <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent">
              {totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-black transition-all hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-black transition-all hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-transparent relative overflow-hidden">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-transparent backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary-600 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                    <div className="relative w-14 h-14 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                      {(() => {
                        const avatar = generateAvatar(selectedConv.contactId || {});
                        if (avatar.type === 'letter') {
                          return <span className="text-white font-bold text-xl">{avatar.content}</span>;
                        } else {
                          return <span className="text-white font-mono text-xl">{avatar.content}</span>;
                        }
                      })()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      {selectedConv.contactId?.name || 'Usuario'} {selectedConv.contactId?.phoneNumber && `(${formatPhoneNumber(selectedConv.contactId.phoneNumber)})`}
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Conectado • WhatsApp Business
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />

                {messages.length > 0 ? (
                  messages.map((message, idx) => {
                    const isUser = message.direction === 'inbound';
                    
                    // Helper to extract clean text from message content
                    const getMessageText = (msg: any) => {
                      const content = msg.content;
                      if (!content) return '';
                      
                      if (typeof content === 'object') {
                        return content.body || content.text?.body || content.interactive?.button_reply?.title || JSON.stringify(content);
                      }
                      
                      if (typeof content === 'string' && content.trim().startsWith('{')) {
                        try {
                          const parsed = JSON.parse(content);
                          return parsed.body || parsed.text?.body || parsed.interactive?.button_reply?.title || content;
                        } catch (e) {
                          return content;
                        }
                      }
                      
                      return content;
                    };

                    const text = getMessageText(message);

                    return (
                      <div
                        key={message._id || message.id || `msg-${idx}`}
                        className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10`}
                      >
                        <div className={`flex flex-col max-w-[95%] gap-2`}>
                          <div
                            className={`px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] shadow-lg transition-all duration-300 ${!isUser
                              ? 'bg-[#3750f0] text-white rounded-br-none shadow-blue-500/20 hover:scale-[1.02]'
                              : 'bg-[#41f0a5] text-black rounded-bl-none shadow-green-500/20 hover:scale-[1.02]'
                              }`}
                          >
                            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed font-medium">
                              {text}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-2 ${!isUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                              {formatTime(message.createdAt)}
                            </span>
                            {!isUser && <Check className="w-3 h-3 text-primary-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in zoom-in-95 duration-700">
                    <div className="relative">
                      <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 blur-3xl rounded-full" />
                      <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-50 dark:border-slate-700 overflow-hidden group">
                        <span className="text-5xl group-hover:scale-125 transition-transform duration-500">💬</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inicio del Historial</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                        Esta conversación está segura y encriptada. Todo lo que digas aquí quedará registrado en el historial.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-transparent backdrop-blur-md">
                {sendError && (
                  <p className="text-secondary-500 text-xs font-bold mb-2 px-2">{sendError}</p>
                )}
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white transition-all">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 font-bold px-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{sending ? 'Enviando...' : 'Enviar'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-10 animate-in fade-in zoom-in-95 duration-700">
              <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-primary-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-48 h-48 bg-white dark:bg-slate-800 rounded-[3rem] flex items-center justify-center shadow-2xl border-8 border-slate-50 dark:border-slate-900 group-hover:rotate-12 transition-transform duration-700">
                  <span className="text-8xl group-hover:scale-110 transition-transform duration-500">👋</span>
                </div>
              </div>
              <div className="max-w-md space-y-4">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Bienvenido al Centro de Mensajes</h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                  Selecciona una conversación del panel izquierdo para comenzar a gestionar tus interacciones de negocio.
                </p>
                <div className="pt-6">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black shadow-xl hover:scale-105 transition-transform cursor-pointer">
                    <span>Ver Analíticas</span>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </PageBody>
    </div>
  );
};
