// components/WhatsAppNumberSelector.tsx
import React from 'react';
import { Phone, Wifi, WifiOff, AlertCircle, Users, ChevronDown } from 'lucide-react';
import type { WhatsAppNumber } from '../types';

interface WhatsAppNumberSelectorProps {
  numbers: WhatsAppNumber[];
  selectedNumber: string;
  onNumberChange: (numberId: string) => void;
  disabled?: boolean;
  showStatus?: boolean;
  showAssignedUsers?: boolean;
  className?: string;
}

export const WhatsAppNumberSelector: React.FC<WhatsAppNumberSelectorProps> = ({
  numbers,
  selectedNumber,
  onNumberChange,
  disabled = false,
  showStatus = true,
  showAssignedUsers = false,
  className = ''
}) => {
  const selectedNumberData = numbers.find(n => n.id === selectedNumber);

  const getStatusIcon = (status: WhatsAppNumber['status']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <AlertCircle className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: WhatsAppNumber['status']) => {
    switch (status) {
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'connecting':
        return 'border-yellow-200 bg-yellow-50';
      case 'disconnected':
        return 'border-gray-200 bg-gray-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = (status: WhatsAppNumber['status']) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  if (numbers.length === 0) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <div className="flex items-center text-gray-500">
          <Phone className="w-5 h-5 mr-2" />
          <span>No hay números WhatsApp configurados</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedNumber}
        onChange={(e) => onNumberChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 pr-10 border rounded-lg appearance-none
          bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${selectedNumberData ? getStatusColor(selectedNumberData.status) : ''}
        `}
      >
        <option value="">Selecciona un número WhatsApp</option>
        {numbers.map((number) => (
          <option key={number.id} value={number.id}>
            {number.display_name} ({number.phone_number}) - {getStatusText(number.status)}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {selectedNumberData && (
        <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedNumberData.display_name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedNumberData.phone_number}
                </div>
              </div>
            </div>

            {showStatus && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedNumberData.status)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getStatusText(selectedNumberData.status)}
                </span>
              </div>
            )}
          </div>

          {showAssignedUsers && selectedNumberData.assigned_users.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 mr-1" />
                <span>{selectedNumberData.assigned_users.length} usuarios asignados</span>
              </div>
            </div>
          )}

          {selectedNumberData.last_connected_at && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Última conexión: {new Date(selectedNumberData.last_connected_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente compacto para usar en headers
interface CompactWhatsAppNumberSelectorProps {
  numbers: WhatsAppNumber[];
  selectedNumber: string;
  onNumberChange: (numberId: string) => void;
  disabled?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const CompactWhatsAppNumberSelector: React.FC<CompactWhatsAppNumberSelectorProps> = ({
  numbers,
  selectedNumber,
  onNumberChange,
  disabled = false,
  showStatus = true,
  className = ''
}) => {
  const selectedNumberData = numbers.find(n => n.id === selectedNumber);

  const getStatusIcon = (status: WhatsAppNumber['status']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <AlertCircle className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  if (numbers.length === 0) {
    return (
      <div className={`flex items-center text-gray-500 ${className}`}>
        <Phone className="w-4 h-4 mr-2" />
        <span className="text-sm">Sin números</span>
      </div>
    );
  }

  if (numbers.length === 1) {
    const number = numbers[0];
    return (
      <div className={`flex items-center ${className}`}>
        {showStatus && getStatusIcon(number.status)}
        <span className="ml-2 font-medium">{number.display_name}</span>
        <span className="ml-2 text-sm text-gray-500">({number.phone_number})</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {selectedNumberData && showStatus && getStatusIcon(selectedNumberData.status)}
      <select
        value={selectedNumber}
        onChange={(e) => onNumberChange(e.target.value)}
        disabled={disabled}
        className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {numbers.map((number) => (
          <option key={number.id} value={number.id}>
            {number.display_name}
          </option>
        ))}
      </select>
    </div>
  );
};
