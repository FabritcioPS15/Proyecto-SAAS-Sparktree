import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
}

interface Profile {
  id: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  organizationId: string | null;
  activeProfile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'b97c9ebb-5dda-4234-9588-5ddd46c1478e',
    email: 'admin@sparktree.io',
    full_name: 'Super Administrador',
    role: 'admin',
    organization_id: '7170954e-da49-4c74-acf7-b22aa5b44cb4'
  });
  const [organizationId, setOrganizationId] = useState<string | null>('7170954e-da49-4c74-acf7-b22aa5b44cb4');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    /*
    const savedSession = localStorage.getItem('sparktree_session');
    if (savedSession) {
      try {
        const { user, organizationId, activeProfile } = JSON.parse(savedSession);
        setUser(user);
        setOrganizationId(organizationId);
        if (activeProfile) setActiveProfile(activeProfile);
      } catch (e) {
        console.error('Failed to restore session', e);
        localStorage.removeItem('sparktree_session');
      }
    }
    */
    localStorage.setItem('sparktree_session', JSON.stringify({ 
      user: {
        id: 'b97c9ebb-5dda-4234-9588-5ddd46c1478e',
        email: 'admin@sparktree.io',
        full_name: 'Super Administrador',
        role: 'admin',
        organization_id: '7170954e-da49-4c74-acf7-b22aa5b44cb4'
      },
      organizationId: '7170954e-da49-4c74-acf7-b22aa5b44cb4',
      activeProfile: null
    }));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const { user: userData, organizationId: orgId } = response.data;
      
      setUser(userData);
      setOrganizationId(orgId);
      
      localStorage.setItem('sparktree_session', JSON.stringify({ 
        user: userData, 
        organizationId: orgId,
        activeProfile: null
      }));
    } catch (error: any) {
      console.error('Login failed', error);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setOrganizationId(null);
    setActiveProfile(null);
    localStorage.removeItem('sparktree_session');
    
    // Forzar la redirección al login
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  const selectProfile = (profile: Profile) => {
    setActiveProfile(profile);
    const savedSession = localStorage.getItem('sparktree_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      localStorage.setItem('sparktree_session', JSON.stringify({ ...parsed, activeProfile: profile }));
    }
  };

  const clearProfile = () => {
    setActiveProfile(null);
    const savedSession = localStorage.getItem('sparktree_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      localStorage.setItem('sparktree_session', JSON.stringify({ ...parsed, activeProfile: null }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, organizationId, activeProfile, loading, login, logout, selectProfile, clearProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
