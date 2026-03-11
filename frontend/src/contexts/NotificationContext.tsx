import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getConversations } from '../services/api';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 10 seconds for non-important notifications
    if (notification.type !== 'error' && notification.type !== 'warning') {
      setTimeout(() => {
        markAsRead(newNotification.id);
      }, 10000);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    // Remove read notifications after 1 second
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 1000);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // En un sistema real, esto usaría WebSockets. Por ahora, hacemos un polling cada 15 segundos.
    let lastLatestMessageTime: string | null = null;

    const checkNewMessages = async () => {
      try {
        const convs = await getConversations();

        if (convs && convs.length > 0) {
          const latestConv = convs[0];
          const latestTime = latestConv.lastMessageAt;

          if (lastLatestMessageTime && latestTime && new Date(latestTime) > new Date(lastLatestMessageTime)) {
            const hasName = latestConv.contactId?.name && latestConv.contactId.name !== 'Sin nombre';
            const contactInfo = hasName
              ? `${latestConv.contactId.name} (${latestConv.contactId.phoneNumber})`
              : latestConv.contactId?.phoneNumber || 'Desconocido';

            // Check if direction is inbound (we assume if there's a new message and it's from the contact)
            addNotification({
              type: 'info',
              title: 'Nuevo Mensaje Recibido',
              message: `El contacto ${contactInfo} te ha escrito a las ${new Date(latestTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
              action: {
                label: 'Ver Chat',
                onClick: () => {
                  window.location.href = '/conversations';
                }
              }
            });
          }

          if (latestTime) {
            lastLatestMessageTime = latestTime;
          }
        }
      } catch (error) {
        console.error('Error checking new messages:', error);
      }
    };

    // Check every 15 seconds
    const interval = setInterval(checkNewMessages, 15000);
    checkNewMessages();

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component for Header
export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} no leídas
              </span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {notification.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {notification.title}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                      {notification.message}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                      {notification.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
