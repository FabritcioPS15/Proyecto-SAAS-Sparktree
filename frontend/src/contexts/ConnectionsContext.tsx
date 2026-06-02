import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PlatformType = 'whatsapp' | 'telegram' | 'instagram' | 'facebook_messenger' | 'tiktok';

export interface PlatformConnection {
  id: string;
  platform_type: PlatformType;
  display_name: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'pending' | 'error_sync';
  phone_number?: string;
  username?: string;
  connected_at?: string;
  last_sync_at?: string;
}

interface ConnectionsContextType {
  connections: PlatformConnection[];
  addConnection: (platform: PlatformType, data: any) => Promise<void>;
  removeConnection: (id: string) => Promise<void>;
  getConnectionByPlatform: (platform: PlatformType) => PlatformConnection | undefined;
  isConnecting: (platform: PlatformType) => boolean;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(undefined);

export const useConnections = () => {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnections must be used within ConnectionsProvider');
  }
  return context;
};

export const ConnectionsProvider = ({ children }: { children: ReactNode }) => {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);

  // Load connections from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('platform_connections');
    if (saved) {
      try {
        setConnections(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading connections:', e);
      }
    }
  }, []);

  // Save connections to localStorage when they change
  useEffect(() => {
    localStorage.setItem('platform_connections', JSON.stringify(connections));
  }, [connections]);

  const addConnection = async (platform: PlatformType, data: any) => {
    // Simulate connection process
    setConnections(prev => 
      prev.map(c => 
        c.platform_type === platform 
          ? { ...c, status: 'connecting' as const }
          : c
      )
    );

    // Simulate delay based on platform
    const delay = platform === 'whatsapp' || platform === 'telegram' ? 3000 : 2000;
    
    await new Promise(resolve => setTimeout(resolve, delay));

    const newConnection: PlatformConnection = {
      id: `${platform}_${Date.now()}`,
      platform_type: platform,
      display_name: data.displayName || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Connection`,
      status: 'connected',
      phone_number: data.phoneNumber,
      username: data.username,
      connected_at: new Date().toISOString()
    };

    setConnections(prev => {
      // Remove existing connection for this platform
      const filtered = prev.filter(c => c.platform_type !== platform);
      return [...filtered, newConnection];
    });
  };

  const removeConnection = async (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const getConnectionByPlatform = (platform: PlatformType) => {
    return connections.find(c => c.platform_type === platform);
  };

  const isConnecting = (platform: PlatformType) => {
    const conn = getConnectionByPlatform(platform);
    return conn?.status === 'connecting';
  };

  return (
    <ConnectionsContext.Provider value={{
      connections,
      addConnection,
      removeConnection,
      getConnectionByPlatform,
      isConnecting
    }}>
      {children}
    </ConnectionsContext.Provider>
  );
};
