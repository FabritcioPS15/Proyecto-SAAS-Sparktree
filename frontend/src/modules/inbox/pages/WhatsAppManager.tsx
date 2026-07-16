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
import api from '../../../services/api';
import { PageLoader } from '../../../components/layout/PageLoader';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageBody } from '../../../components/layout/PageBody';
import { PageContainer } from '../../../components/layout/PageContainer';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useNotifications } from '../../../contexts/NotificationContext';

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

const MAX_CONNECTIONS = 5;

export const WhatsAppManager = () => {
  const { addNotification } = useNotifications();
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const atLimit = connections.length >= MAX_CONNECTIONS;
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnection | null>(null);
  const [newConnectionName, setNewConnectionName] = useState('');
  const [qrModal, setQrModal] = useState<{ connection: WhatsAppConnection; qr: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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
      addNotification({ type: 'success', title: 'Conexión creada', message: `"${newConnection.display_name}" está lista para conectar.` });
      
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
    try {
      await api.delete(`/multi-whatsapp/connections/${connectionId}`);
      const deleted = connections.find(c => c.id === connectionId);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      if (deleted) addNotification({ type: 'success', title: 'Conexión eliminada', message: `"${deleted.display_name}" ha sido desconectada.` });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const assignFlow = async (connectionId: string, flowId: string) => {
    try {
      await api.post(`/multi-whatsapp/connections/${connectionId}/assign-flow`, { flowId });
      addNotification({ type: 'success', title: 'Flow asignado', message: 'Flow asignado exitosamente a la conexión.' });
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
      addNotification({ type: 'success', title: 'Mensaje enviado', message: 'Mensaje de prueba enviado correctamente.' });
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
    <PageContainer>
      <PageHeader
        title="Gestión de"
        highlight="WhatsApp"
        description="Gestiona múltiples conexiones y asigna flujos a cada una."
        icon={Smartphone}
        action={
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/80 dark:text-gray-400">
              <span className="font-bold text-white">{connections.length}</span> / {MAX_CONNECTIONS} conexiones
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={atLimit}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                atLimit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-black hover:scale-105 active:scale-95'
              }`}
              title={atLimit ? `Máximo de ${MAX_CONNECTIONS} conexiones alcanzado` : undefined}
            >
              <Plus className="w-4 h-4" />
              Nueva Conexión
            </button>
          </div>
        }
      />

      {atLimit && (
        <div className="mx-3 md:mx-4 mb-1 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Has alcanzado el límite máximo de {MAX_CONNECTIONS} conexiones. Elimina una conexión existente para crear una nueva.
          </p>
        </div>
      )}

      <PageBody>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(connection.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageBody>

      {/* Create Connection Modal */}
      <Modal
        open={showCreateForm}
        onClose={() => { setShowCreateForm(false); setNewConnectionName(''); }}
        title="Nueva Conexión WhatsApp"
        icon={<Smartphone className="w-5 h-5 text-accent-500" />}
        size="sm"
      >
        <input
          type="text"
          placeholder="Nombre (ej. Sales Bot, Support Bot)"
          value={newConnectionName}
          onChange={(e) => setNewConnectionName(e.target.value)}
          className="w-full px-4 py-3.5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60"
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setShowCreateForm(false); setNewConnectionName(''); }}
            className="flex-1 py-3.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700 transition-colors rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={createConnection}
            className="flex-1 py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md"
          >
            Crear
          </button>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        open={qrModal !== null}
        onClose={() => setQrModal(null)}
        title="Escanear Código QR"
        icon={<QrCode className="w-5 h-5 text-accent-500" />}
        size="sm"
      >
        {qrModal && (
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl mb-4">
            <img src={qrModal.qr} alt="QR Code" className="w-full" />
          </div>
        )}
        <button
          onClick={() => setQrModal(null)}
          className="w-full py-3 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md"
        >
          Cerrar
        </button>
      </Modal>

      {/* Connection Settings Modal */}
      <Modal
        open={selectedConnection !== null}
        onClose={() => setSelectedConnection(null)}
        title={selectedConnection?.display_name ?? ''}
        icon={<Settings className="w-5 h-5 text-accent-500" />}
        size="lg"
      >
        {selectedConnection && (
          <div className="space-y-6">
            {/* Flow Assignment */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Flow Asignado
              </h3>
              <Dropdown
                value=""
                onChange={(v) => { if (v) assignFlow(selectedConnection.id, v); }}
                placeholder="Selecciona un flow..."
                options={flows.map(flow => ({ value: flow.id, label: `${flow.name} (${flow.status})` }))}
              />
            </div>

            {/* Test Message */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Enviar Mensaje de Prueba
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Número telefónico (con código de país)"
                  value={testMessage.to}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-4 py-3.5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60"
                />
                <textarea
                  placeholder="Mensaje de prueba"
                  value={testMessage.message}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3.5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60 resize-none"
                />
                <button
                  onClick={() => sendTestMessage(selectedConnection.id)}
                  disabled={selectedConnection.status !== 'connected'}
                  className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Mensaje de Prueba
                </button>
              </div>
            </div>

            {/* Connection Info */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Información de Conexión</h3>
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700/30">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedConnection.status)}`}>
                    {selectedConnection.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedConnection.phone_number || 'No conectado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Creada:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedConnection.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedConnection.last_connected_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Última conexión:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedConnection.last_connected_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteConnection(deleteTarget); setDeleteTarget(null); } }}
        title="Eliminar Conexión"
        message="¿Eliminar esta conexión de WhatsApp? Se desconectará el bot y se eliminarán todos los datos asociados."
        confirmText="Eliminar"
        variant="danger"
      />
    </PageContainer>
  );
};

