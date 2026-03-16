// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  global_role: 'super_admin' | 'user';
  company_role?: 'admin' | 'member';
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isRegularUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Por ahora, simulamos autenticación básica
        // En producción, aquí iría la verificación real del token
        
        let userData = null;
        if (token === 'super-admin-token') {
          userData = {
            id: 'super-admin-id',
            email: 'admin@saas.com',
            global_role: 'super_admin' as const
          };
        } else if (token === 'company-admin-token') {
          userData = {
            id: 'company-admin-id',
            email: 'company@admin.com',
            global_role: 'user' as const,
            company_role: 'admin' as const,
            organization_id: '00000000-0000-0000-0000-000000000001'
          };
        } else if (token === 'user-token') {
          userData = {
            id: 'user-id',
            email: 'user@company.com',
            global_role: 'user' as const,
            company_role: 'member' as const,
            organization_id: '00000000-0000-0000-0000-000000000001'
          };
        }
        
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      let token = '';
      let userData = null;

      // Por ahora, simulamos login básico
      // En producción, aquí iría la llamada real al API
      if (email === 'admin@saas.com' && password === 'admin123') {
        token = 'super-admin-token';
        userData = {
          id: 'super-admin-id',
          email: 'admin@saas.com',
          global_role: 'super_admin' as const
        };
      } else if (email === 'company@admin.com' && password === 'admin123') {
        token = 'company-admin-token';
        userData = {
          id: 'company-admin-id',
          email: 'company@admin.com',
          global_role: 'user' as const,
          company_role: 'admin' as const,
          organization_id: '00000000-0000-0000-0000-000000000001'
        };
      } else if (email === 'user@company.com' && password === 'user123') {
        token = 'user-token';
        userData = {
          id: 'user-id',
          email: 'user@company.com',
          global_role: 'user' as const,
          company_role: 'member' as const,
          organization_id: '00000000-0000-0000-0000-000000000001'
        };
      } else {
        throw new Error('Credenciales incorrectas');
      }

      localStorage.setItem('auth_token', token);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const isSuperAdmin = user?.global_role === 'super_admin';
  const isCompanyAdmin = user?.company_role === 'admin';
  const isRegularUser = user?.company_role === 'member';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isSuperAdmin,
      isCompanyAdmin,
      isRegularUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
