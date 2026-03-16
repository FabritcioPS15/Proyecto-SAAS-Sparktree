// hooks/useWhatsAppNumbers.ts
import { useState, useEffect } from 'react';
import { WhatsAppNumber } from '../types';

interface UseWhatsAppNumbersReturn {
  numbers: WhatsAppNumber[];
  loading: boolean;
  error: string | null;
  selectedNumber: string;
  setSelectedNumber: (numberId: string) => void;
  refreshNumbers: () => Promise<void>;
  addNumber: (number: Omit<WhatsAppNumber, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNumber: (id: string, updates: Partial<WhatsAppNumber>) => Promise<void>;
  deleteNumber: (id: string) => Promise<void>;
  connectNumber: (id: string) => Promise<void>;
  disconnectNumber: (id: string) => Promise<void>;
}

export const useWhatsAppNumbers = (organizationId?: string): UseWhatsAppNumbersReturn => {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string>('');

  useEffect(() => {
    fetchNumbers();
  }, [organizationId]);

  const fetchNumbers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      let endpoint = '/api/whatsapp-numbers';
      if (organizationId) {
        endpoint = `/api/organizations/${organizationId}/whatsapp-numbers`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNumbers(data);
        
        // Seleccionar el primer número conectado si no hay selección
        if (!selectedNumber && data.length > 0) {
          const connectedNumber = data.find((n: WhatsAppNumber) => n.status === 'connected');
          setSelectedNumber(connectedNumber?.id || data[0].id);
        }
      } else {
        throw new Error('Failed to fetch WhatsApp numbers');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp numbers:', error);
      setError('Error al cargar números WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const refreshNumbers = async () => {
    await fetchNumbers();
  };

  const addNumber = async (newNumber: Omit<WhatsAppNumber, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/whatsapp-numbers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNumber)
      });

      if (response.ok) {
        const createdNumber = await response.json();
        setNumbers(prev => [...prev, createdNumber]);
        setSelectedNumber(createdNumber.id);
      } else {
        throw new Error('Failed to add WhatsApp number');
      }
    } catch (error) {
      console.error('Error adding WhatsApp number:', error);
      throw error;
    }
  };

  const updateNumber = async (id: string, updates: Partial<WhatsAppNumber>) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/whatsapp-numbers/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedNumber = await response.json();
        setNumbers(prev => prev.map(n => n.id === id ? updatedNumber : n));
      } else {
        throw new Error('Failed to update WhatsApp number');
      }
    } catch (error) {
      console.error('Error updating WhatsApp number:', error);
      throw error;
    }
  };

  const deleteNumber = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/whatsapp-numbers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNumbers(prev => prev.filter(n => n.id !== id));
        if (selectedNumber === id) {
          setSelectedNumber('');
        }
      } else {
        throw new Error('Failed to delete WhatsApp number');
      }
    } catch (error) {
      console.error('Error deleting WhatsApp number:', error);
      throw error;
    }
  };

  const connectNumber = async (id: string) => {
    try {
      await updateNumber(id, { status: 'connecting' });
      
      // Simular conexión - en producción esto se conectaría con el servicio real
      setTimeout(async () => {
        try {
          await updateNumber(id, { 
            status: 'connected',
            last_connected_at: new Date().toISOString()
          });
        } catch (error) {
          await updateNumber(id, { status: 'error' });
        }
      }, 3000);
    } catch (error) {
      console.error('Error connecting WhatsApp number:', error);
      throw error;
    }
  };

  const disconnectNumber = async (id: string) => {
    try {
      await updateNumber(id, { status: 'disconnected' });
    } catch (error) {
      console.error('Error disconnecting WhatsApp number:', error);
      throw error;
    }
  };

  return {
    numbers,
    loading,
    error,
    selectedNumber,
    setSelectedNumber,
    refreshNumbers,
    addNumber,
    updateNumber,
    deleteNumber,
    connectNumber,
    disconnectNumber
  };
};
