import { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, Check, CheckCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
  read: boolean;
  delivered?: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
  messages: Message[];
}

export const WhatsAppChat = () => {
  const { theme } = useTheme();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const chats: Chat[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      lastMessage: 'Hola, necesito ayuda con mi cuenta',
      time: '12:30',
      unread: 3,
      online: true,
      avatar: 'JP',
      messages: [
        { id: '1', text: 'Hola, ¿cómo estás?', time: '12:25', sent: false, read: true },
        { id: '2', text: '¡Hola! Estoy bien, gracias por preguntar', time: '12:26', sent: true, read: true, delivered: true },
        { id: '3', text: 'Necesito ayuda con mi cuenta', time: '12:28', sent: false, read: true },
        { id: '4', text: 'Claro, ¿en qué puedo ayudarte?', time: '12:29', sent: true, read: true, delivered: true },
        { id: '5', text: 'Hola, necesito ayuda con mi cuenta', time: '12:30', sent: false, read: false },
      ]
    },
    {
      id: '2',
      name: 'María García',
      lastMessage: 'Gracias por la ayuda',
      time: '11:45',
      unread: 0,
      online: false,
      avatar: 'MG',
      messages: [
        { id: '1', text: '¿Podrías ayudarme con el problema?', time: '11:40', sent: false, read: true },
        { id: '2', text: 'Por supuesto, dime qué necesitas', time: '11:42', sent: true, read: true, delivered: true },
        { id: '3', text: 'Necesito configurar mi perfil', time: '11:43', sent: false, read: true },
        { id: '4', text: 'Te envío los pasos', time: '11:44', sent: true, read: true, delivered: true },
        { id: '5', text: 'Gracias por la ayuda', time: '11:45', sent: false, read: true },
      ]
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      lastMessage: 'Nos vemos mañana',
      time: '10:30',
      unread: 0,
      online: true,
      avatar: 'CR',
      messages: [
        { id: '1', text: '¿Podemos reunirnos mañana?', time: '10:25', sent: false, read: true },
        { id: '2', text: 'Claro, ¿a qué hora?', time: '10:27', sent: true, read: true, delivered: true },
        { id: '3', text: 'A las 3pm está bien?', time: '10:28', sent: false, read: true },
        { id: '4', text: 'Perfecto, nos vemos entonces', time: '10:29', sent: true, read: true, delivered: true },
        { id: '5', text: 'Nos vemos mañana', time: '10:30', sent: false, read: true },
      ]
    },
    {
      id: '4',
      name: 'Ana Martínez',
      lastMessage: 'Perfecto, gracias!',
      time: 'Ayer',
      unread: 0,
      online: false,
      avatar: 'AM',
      messages: [
        { id: '1', text: 'Ya revisé el documento', time: 'Ayer', sent: true, read: true, delivered: true },
        { id: '2', text: '¿Todo está en orden?', time: 'Ayer', sent: false, read: true },
        { id: '3', text: 'Sí, todo perfecto', time: 'Ayer', sent: true, read: true, delivered: true },
        { id: '4', text: 'Perfecto, gracias!', time: 'Ayer', sent: false, read: true },
      ]
    },
    {
      id: '5',
      name: 'Luis Sánchez',
      lastMessage: '👍',
      time: 'Lunes',
      unread: 1,
      online: false,
      avatar: 'LS',
      messages: [
        { id: '1', text: 'Recibí el archivo', time: 'Lunes', sent: false, read: true },
        { id: '2', text: 'Perfecto, avísame si tienes dudas', time: 'Lunes', sent: true, read: true, delivered: true },
        { id: '3', text: '👍', time: 'Lunes', sent: false, read: false },
      ]
    },
  ];

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatData?.messages]);

  const sendMessage = () => {
    if (message.trim() && selectedChatData) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        read: false,
        delivered: true
      };
      
      // Aquí normalmente harías una llamada API para enviar el mensaje
      console.log('Enviando mensaje:', newMessage);
      setMessage('');
    }
  };

  const MessageStatus = ({ message }: { message: Message }) => {
    if (!message.sent) return null;
    
    if (message.read) {
      return (
        <div className="message-status-check blue">
          <CheckCheck className="w-3 h-3" />
        </div>
      );
    } else if (message.delivered) {
      return (
        <div className="message-status-check double">
          <CheckCheck className="w-3 h-3" />
        </div>
      );
    } else {
      return (
        <div className="message-status-check single">
          <Check className="w-3 h-3" />
        </div>
      );
    }
  };

  const TypingIndicator = () => (
    <div className="typing-indicator">
      <span>escribiendo</span>
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );

  return (
    <div className={`whatsapp-container ${theme === 'dark' ? '' : 'light'}`}>
      {/* Sidebar */}
      <div className="whatsapp-sidebar">
        {/* Header */}
        <div className="whatsapp-header">
          <div className="whatsapp-profile-section">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">YO</span>
            </div>
            <div className="whatsapp-profile-info">
              <div className="whatsapp-profile-name">Mi Estado</div>
              <div className="whatsapp-profile-status">Disponible</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="whatsapp-action-button">
              <Search className="w-5 h-5" />
            </button>
            <button className="whatsapp-action-button">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="whatsapp-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar o empezar un chat nuevo"
              className="whatsapp-search-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="whatsapp-chat-list">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`whatsapp-chat-item ${selectedChat === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className={`whatsapp-avatar ${chat.online ? 'online' : ''}`}>
                {chat.avatar}
              </div>
              <div className="whatsapp-chat-info">
                <div className="whatsapp-chat-name">{chat.name}</div>
                <div className="whatsapp-chat-message">{chat.lastMessage}</div>
              </div>
              <div className="whatsapp-chat-meta">
                <div className="whatsapp-chat-time">{chat.time}</div>
                {chat.unread > 0 && (
                  <div className="whatsapp-chat-badge">{chat.unread}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="whatsapp-main">
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="whatsapp-chat-header">
              <div className={`whatsapp-avatar ${selectedChatData.online ? 'online' : ''}`}>
                {selectedChatData.avatar}
              </div>
              <div className="whatsapp-chat-info-header">
                <div className="whatsapp-chat-name-header">
                  {selectedChatData.name}
                </div>
                <div className="whatsapp-chat-status-header">
                  {selectedChatData.online ? 'En línea' : 'Última vez: ' + selectedChatData.time}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="whatsapp-action-button">
                  <Search className="w-5 h-5" />
                </button>
                <button className="whatsapp-action-button">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="whatsapp-chat-messages">
              {selectedChatData.messages.map((msg) => (
                <div key={msg.id} className={`whatsapp-message ${msg.sent ? 'sent' : 'received'}`}>
                  <div className="whatsapp-message-bubble">
                    <div className="whatsapp-message-text">{msg.text}</div>
                    <div className="whatsapp-message-meta">
                      <span className="whatsapp-message-time">{msg.time}</span>
                      <div className="whatsapp-message-status">
                        <MessageStatus message={msg} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {selectedChatData.online && Math.random() > 0.8 && (
                <div className="whatsapp-message received">
                  <div className="whatsapp-message-bubble">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="whatsapp-chat-input">
              <button className="whatsapp-action-button">
                <Paperclip className="w-5 h-5" />
              </button>
              <button 
                className="whatsapp-action-button"
                onClick={() => setShowEmoji(!showEmoji)}
              >
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje"
                className="whatsapp-input-field"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                className="whatsapp-input-button"
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                {message.trim() ? (
                  <Send className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="whatsapp-empty-state">
            <div className="whatsapp-empty-state-content">
              <div className="whatsapp-empty-state-icon">
                <Search className="w-16 h-16" />
              </div>
              <h3 className="whatsapp-empty-state-title">
                WhatsApp Web
              </h3>
              <p className="whatsapp-empty-state-description">
                Envía y recibe mensajes sin mantener tu teléfono conectado. 
                Usa WhatsApp en hasta cuatro dispositivos conectados y un teléfono al mismo tiempo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
