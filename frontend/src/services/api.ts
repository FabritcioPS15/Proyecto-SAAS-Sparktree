import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(new Error('Sesión expirada'));
    }
    
    // Manejar errores de red
    if (!error.response) {
      return Promise.reject(new Error('Error de conexión. Verifica tu internet.'));
    }
    
    // Manejar otros errores HTTP
    const message = error.response.data?.message || `Error ${error.response.status}`;
    return Promise.reject(new Error(message));
  }
);

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (id: string) => {
  try {
    const response = await api.get(`/conversations/${id}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const deleteConversation = async (id: string) => {
  try {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const getAnalytics = async () => {
  try {
    const response = await api.get('/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const saveSettings = async (settingsData: any) => {
  try {
    const response = await api.post('/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getFlows = async () => {
  try {
    const response = await api.get('/flows');
    return response.data;
  } catch (error) {
    console.error('Error fetching flows:', error);
    throw error;
  }
};

export const saveFlows = async (flowData: any, id?: string) => {
  try {
    if (id) {
      const response = await api.put(`/flows/${id}`, flowData);
      return response.data;
    } else {
      const response = await api.post('/flows', flowData);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving flow:', error);
    throw error;
  }
};

export const getLeads = async () => {
  try {
    const response = await api.get('/leads');
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error; // Let the component handle the fallback
  }
};

export const getQRStatus = async () => {
  try {
    const response = await api.get('/qr/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching QR status:', error);
    throw error;
  }
};

export const initializeQR = async () => {
  try {
    const response = await api.post('/qr/init');
    return response.data;
  } catch (error) {
    console.error('Error initializing QR:', error);
    throw error;
  }
};

export const logoutQR = async () => {
  try {
    const response = await api.post('/qr/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out QR:', error);
    throw error;
  }
};

export default api;
