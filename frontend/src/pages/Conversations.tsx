import { useState, useEffect } from 'react';
import { getConversations, getConversationMessages } from '../services/api';

export const Conversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then(data => {
        setConversations(data);
        if (data.length > 0) setSelectedConv(data[0]);
      })
      .catch(err => console.error('Failed to load conversations', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedConv) {
      getConversationMessages(selectedConv._id)
        .then(data => setMessages(data))
        .catch(err => console.error('Failed to load messages', err));
    }
  }, [selectedConv]);

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Conversaciones</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Revisa el historial de mensajes de tus usuarios</p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden h-[650px] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          <div className="border-r border-gray-200/50 dark:border-gray-800/50 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50/30 dark:bg-gray-800/20">
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-800/50 flex-none sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs">Usuarios Recientes</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50 flex-1">
              {loading ? (
                <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No hay conversaciones</div>
              ) : (
                conversations.map((conv) => {
                  const contact = conv.contactId || {};
                  const isSelected = selectedConv?._id === conv._id;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full p-4 text-left transition-all duration-200 border-l-4 ${
                        isSelected ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-500' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {contact.phoneNumber ? contact.phoneNumber.slice(-2) : '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate transition-colors ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-200'}`}>
                            {contact.phoneNumber || 'Desconocido'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatDate(conv.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col bg-white dark:bg-gray-900/30 relative">
            {selectedConv ? (
              <>
                <div className="p-5 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center gap-4 flex-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 sticky top-0">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] shadow-md">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {selectedConv.contactId?.phoneNumber ? selectedConv.contactId.phoneNumber.slice(-2) : '??'}
                      </div>
                   </div>
                   <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      {selectedConv.contactId?.phoneNumber || 'Desconocido'}
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-[#0B1120]/50 custom-scrollbar">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      // API uses 'inbound' (from user to bot) and 'outbound' (bot to user)
                      const isUser = message.direction === 'inbound';
                      const text = message.content?.body || message.content || '';
                      
                      return (
                      <div
                        key={message._id}
                        className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div className="flex flex-col max-w-[75%] gap-1">
                          <div
                            className={`rounded-2xl px-5 py-3 shadow-sm ${
                              !isUser
                                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm md:text-[15px] whitespace-pre-wrap leading-relaxed">{typeof text === 'string' ? text : JSON.stringify(text)}</p>
                          </div>
                          <p
                            className={`text-[11px] font-medium px-1 ${
                              !isUser
                                ? 'text-gray-500 text-right'
                                : 'text-gray-500 text-left'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-2xl opacity-50">💬</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Aún no hay mensajes</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                 <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <span className="text-3xl opacity-40">👋</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Ninguna conversación seleccionada</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto mt-2">Selecciona un usuario de la lista a la izquierda para ver la conversación.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
