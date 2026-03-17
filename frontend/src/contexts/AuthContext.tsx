import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
}

interface AuthContextType {
  user: User | null;
  organizationId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedSession = localStorage.getItem('sparktree_session');
    if (savedSession) {
      try {
        const { user, organizationId } = JSON.parse(savedSession);
        setUser(user);
        setOrganizationId(organizationId);
      } catch (e) {
        console.error('Failed to restore session', e);
        localStorage.removeItem('sparktree_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { user, organizationId } = response.data;
      
      setUser(user);
      setOrganizationId(organizationId);
      
      localStorage.setItem('sparktree_session', JSON.stringify({ user, organizationId }));
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setOrganizationId(null);
    localStorage.removeItem('sparktree_session');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, organizationId, loading, login, logout }}>
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
