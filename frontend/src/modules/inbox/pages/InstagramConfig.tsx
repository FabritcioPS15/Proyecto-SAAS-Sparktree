import { useState } from 'react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import {
  CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw,
  LogOut, ArrowRight, Info, Clock, User, Image,
  Layers, Shield
} from 'lucide-react';
import { Loader } from '../../../components/ui/Loader';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageBody } from '../../../components/layout/PageBody';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ConnectionLayout, EcosystemStatus } from '../components/ConnectionLayout';
import { useConnections } from '../../../contexts/ConnectionsContext';
import { cn } from '../../../utils/cn';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

type Status = 'disconnected' | 'connecting' | 'selecting_account' | 'connected' | 'token_expired';

interface InstagramData {
  igAccountId: string;
  igUsername: string;
  facebookPageId: string;
  facebookPageName: string;
  profilePicUrl: string;
  status: Status;
  connectedAt?: string;
  tokenExpiresAt?: string;
}

// Mock options for page selection
const mockPages = [
  { id: 'pg_001', name: 'Página Oficial SparkBot', igUsername: '@sparkbot_oficial', igAccountId: 'ig_001', profilePicUrl: '' },
  { id: 'pg_002', name: 'SparkBot Marketing', igUsername: '@sparkbot_mkt', igAccountId: 'ig_002', profilePicUrl: '' },
];

const prerequisites = [
  'La cuenta de Instagram debe ser una cuenta profesional (Business o Creator)',
  'Debe estar vinculada a una Página de Facebook',
  'El usuario debe ser administrador de esa página',
];

export const InstagramConfig = () => {
  const { addNotification } = useNotifications();
  const { addConnection, removeConnection, getConnectionByPlatform, isConnecting } = useConnections();
  const existingConnection = getConnectionByPlatform('instagram');
  const [data, setData] = useState<InstagramData>({
    igAccountId: '',
    igUsername: '',
    facebookPageId: '',
    facebookPageName: '',
    profilePicUrl: '',
    status: existingConnection ? 'connected' : 'disconnected',
  });
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const dbConnected = !!existingConnection;
  const isConnected = data.status === 'connected' || dbConnected;
  const isExpired = data.status === 'token_expired';
  const isSelecting = data.status === 'selecting_account';

  const handleConnect = async () => {
    // TODO: iniciar OAuth real con Meta (redirect a Facebook Login Dialog con permisos pages_messaging, instagram_manage_messages)
    setData(prev => ({ ...prev, status: 'connecting' }));

    setLoading(true);
    setLoadingLabel('Redirigiendo a Facebook...');
    await new Promise(r => setTimeout(r, 1000));

    setLoadingLabel('Autorizando permisos...');
    await new Promise(r => setTimeout(r, 1000));

    setLoading(false);
    // TODO: GET /api/channels/instagram/pages para listar páginas disponibles tras el callback
    setData(prev => ({ ...prev, status: 'selecting_account' }));
    setSelectedPage(null);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPage(pageId);
  };

  const handleConfirmPage = async () => {
    if (!selectedPage) return;
    const page = mockPages.find(p => p.id === selectedPage);
    if (!page) return;

    setLoading(true);
    setLoadingLabel('Conectando cuenta...');
    try {
      await addConnection('instagram', {
        instagramBusinessAccountId: page.igAccountId,
        facebookPageId: page.id,
        accessToken: 'mock_access_token',
        displayName: page.igUsername,
      });
      setData({
        igAccountId: page.igAccountId,
        igUsername: page.igUsername,
        facebookPageId: page.id,
        facebookPageName: page.name,
        profilePicUrl: '',
        status: 'connected',
        connectedAt: new Date().toISOString(),
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err) {
      console.error('Error connecting Instagram:', err);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;
    setLoading(true);
    try {
      await removeConnection(existingConnection.id);
      addNotification({ type: 'success', title: 'Instagram desconectado', message: 'La cuenta de Instagram fue desconectada correctamente.' });
      setData({
        igAccountId: '', igUsername: '', facebookPageId: '', facebookPageName: '',
        profilePicUrl: '', status: 'disconnected',
      });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo desconectar Instagram.' });
      console.error('Error disconnecting Instagram:', err);
    }
    setLoading(false);
    setShowConfirm(false);
  };

  const handleReconnect = () => {
    setData(prev => ({ ...prev, status: 'disconnected' }));
    handleConnect();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Conexión de"
        highlight="Instagram"
        description="Conecta tu cuenta de Instagram Business para automatizar mensajes."
        icon={FaInstagram}
        action={
          isConnected ? (
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Cuenta Conectada
            </div>
          ) : isExpired ? (
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Token Vencido
            </div>
          ) : (
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-white dark:bg-dark-card border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Sin Conexión
            </div>
          )
        }
      />

      <PageBody>
      <ConnectionLayout sidebar={<EcosystemStatus platform="instagram" />}>

          {/* --- CONNECTED STATE --- */}
          {isConnected && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/20">
                      <FaInstagram size={34} color="white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-[3px] border-white dark:border-dark-card">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Instagram Conectado</h3>
                    <p className="text-pink-500 font-bold text-sm">{data.igUsername}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Conectado</span>
                      {data.connectedAt && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(data.connectedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Usuario IG
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{data.igUsername}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Página de Facebook
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{data.facebookPageName}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(true)} disabled={loading}
                    className="flex-1 h-11 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
                    <LogOut className="w-3.5 h-3.5" /> Desconectar
                  </button>
                  <button onClick={handleReconnect}
                    className="flex-1 h-11 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-[1.01] active:scale-[0.99]">
                    <RefreshCw className="w-3.5 h-3.5" /> Reconectar
                  </button>
                </div>
              </div>

              <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Los mensajes fuera de una ventana de 24 horas requieren usar plantillas aprobadas por Meta.
                </p>
              </div>
            </div>
          )}

          {/* --- TOKEN EXPIRED STATE --- */}
          {isExpired && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Token Vencido</h3>
              <p className="text-sm text-slate-500 mb-2">El acceso a Instagram ha expirado. Reconecta tu cuenta para seguir usando la automatización.</p>
              {data.tokenExpiresAt && (
                <p className="text-xs text-slate-400 mb-6">Venció el {new Date(data.tokenExpiresAt).toLocaleDateString('es-ES')}</p>
              )}
              <button onClick={handleReconnect}
                className="inline-flex items-center gap-2 h-11 px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg">
                <RefreshCw className="w-4 h-4" /> Reconectar Cuenta
              </button>
            </div>
          )}

          {/* --- SELECTING ACCOUNT --- */}
          {isSelecting && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
                  <FaInstagram size={18} color="white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Selecciona una Cuenta</h3>
                  <p className="text-[10px] text-slate-500">Se encontraron varias páginas vinculadas</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {mockPages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectPage(page.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedPage === page.id
                        ? 'border-pink-500 bg-pink-500/5 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/30'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <FaInstagram size={20} color="white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{page.name}</p>
                        <p className="text-xs text-slate-500">{page.igUsername}</p>
                      </div>
                      {selectedPage === page.id && (
                        <CheckCircle className="w-5 h-5 text-pink-500 shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirmPage}
                disabled={!selectedPage || loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? <><Loader size="xs" /> {loadingLabel}</> : <><ArrowRight className="w-4 h-4" /> Confirmar Selección</>}
              </button>
            </div>
          )}

          {/* --- DISCONNECTED STATE --- */}
          {data.status === 'disconnected' && (
            <>
              {/* Prerequisites checklist */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
                    <Shield size={16} color="white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Requisitos Previos</h3>
                    <p className="text-[10px] text-slate-500">Verifica antes de conectar</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {prerequisites.map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 text-xs text-pink-500 hover:text-pink-400 font-bold mt-4 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  ¿Cómo convertir mi cuenta a profesional?
                </a>
              </div>

              {/* Connect button */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-pink-500/20">
                  <FaInstagram size={28} color="white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Conectar Instagram Business</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                  Autoriza el acceso a través de Facebook para empezar a automatizar tus mensajes de Instagram.
                </p>

                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <><Loader size="xs" /> {loadingLabel}</>
                  ) : (
                    <><FaFacebook size={18} /> Conectar con Facebook</>
                  )}
                </button>
              </div>

              {/* Note */}
              <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Los mensajes fuera de una ventana de 24 horas requieren usar plantillas aprobadas por Meta.
                </p>
              </div>
            </>
          )}
        {/* Confirm disconnect modal */}
        <Modal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          title="Desconectar Instagram"
          size="sm"
          icon={<div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
          footer={
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Cancelar
              </button>
              <button onClick={handleDisconnect} disabled={loading}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Desconectando...' : 'Desconectar'}
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Los flujos de automatización dejarán de funcionar para Instagram.
          </p>
        </Modal>
      </ConnectionLayout>
      </PageBody>
    </PageContainer>
  );
};
