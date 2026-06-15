import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MessageSquare,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import api from '../services/api';
import { PageLoader } from '../components/layout/PageLoader';

interface WhatsAppConnection {
  id: string;
  display_name: string;
  phone_number?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qr_code?: string;
  last_connected_at?: string;
  created_at: string;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
}

export const WhatsAppManager = () => {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnection | null>(null);
  const [newConnectionName, setNewConnectionName] = useState('');
  const [qrModal, setQrModal] = useState<{ connection: WhatsAppConnection; qr: string } | null>(null);
  const [testMessage, setTestMessage] = useState({ to: '', message: '' });
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    loadConnections();
    loadFlows();
  }, []);

  const loadConnections = async () => {
    try {
      const response = await api.get('/multi-whatsapp/connections');
      setConnections(response.data);
    } catch (err) {
      setError('Error loading connections');
    } finally {
      setLoading(false);
    }
  };

  const loadFlows = async () => {
    try {
      const response = await api.get('/flows');
      setFlows(response.data);
    } catch (err) {
      console.error('Error loading flows:', err);
    }
  };

  const createConnection = async () => {
    if (!newConnectionName.trim()) {
      setError('Connection name is required');
      return;
    }

    try {
      const response = await api.post('/multi-whatsapp/connections', { 
        displayName: newConnectionName.trim() 
      });

      const newConnection = response.data;
      setConnections(prev => [newConnection, ...prev]);
      setNewConnectionName('');
      setShowCreateForm(false);
      
      // Show QR for new connection
      setTimeout(() => showQRCode(newConnection), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const showQRCode = async (connection: WhatsAppConnection) => {
    try {
      const response = await api.get(`/multi-whatsapp/connections/${connection.id}/qr`);
      const data = response.data;
      if (data.qr) {
        setQrModal({ connection, qr: data.qr });
      } else {
        setError('QR code not available. Connection might already be active.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this WhatsApp connection? This will disconnect the bot and remove all associated data.')) {
      return;
    }

    try {
      await api.delete(`/multi-whatsapp/connections/${connectionId}`);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const assignFlow = async (connectionId: string, flowId: string) => {
    try {
      await api.post(`/multi-whatsapp/connections/${connectionId}/assign-flow`, { flowId });
      alert('Flow assigned successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const sendTestMessage = async (connectionId: string) => {
    if (!testMessage.to.trim() || !testMessage.message.trim()) {
      setError('Phone number and message are required');
      return;
    }

    try {
      await api.post(`/multi-whatsapp/connections/${connectionId}/test-message`, testMessage);
      alert('Test message sent successfully!');
      setTestMessage({ to: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'connecting':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Smartphone className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'connecting':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return <PageLoader sectionName="Multi-WhatsApp" />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-primary-600" />
              WhatsApp Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage multiple WhatsApp connections and assign flows to each one
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Connection
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <div key={connection.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {connection.display_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {connection.phone_number || 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(connection.status)}`}>
                    {connection.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  {connection.status !== 'connected' && (
                    <button
                      onClick={() => showQRCode(connection)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm"
                    >
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedConnection(connection)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                <button
                  onClick={() => deleteConnection(connection.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Connection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Create New WhatsApp Connection
            </h2>
            <input
              type="text"
              placeholder="Connection Name (e.g., Sales Bot, Support Bot)"
              value={newConnectionName}
              onChange={(e) => setNewConnectionName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewConnectionName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createConnection}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Scan QR Code
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Scan this QR code with WhatsApp to connect "{qrModal.connection.display_name}"
            </p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={qrModal.qr} alt="QR Code" className="w-full" />
            </div>
            <button
              onClick={() => setQrModal(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Connection Settings Modal */}
      {selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedConnection.display_name} Settings
              </h2>
              <button
                onClick={() => setSelectedConnection(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Flow Assignment */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Assigned Flow
                </h3>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      assignFlow(selectedConnection.id, e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a flow to assign...</option>
                  {flows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.name} ({flow.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Message */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Send Test Message
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Phone number (with country code)"
                    value={testMessage.to}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <textarea
                    placeholder="Test message"
                    value={testMessage.message}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <button
                    onClick={() => sendTestMessage(selectedConnection.id)}
                    disabled={selectedConnection.status !== 'connected'}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Send Test Message
                  </button>
                </div>
              </div>

              {/* Connection Info */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Connection Info</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedConnection.status)}`}>
                      {selectedConnection.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedConnection.phone_number || 'Not connected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedConnection.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedConnection.last_connected_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Connected:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedConnection.last_connected_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
