import { useState } from 'react';
import { FaTiktok } from 'react-icons/fa';
import { ExternalLink, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useConnections } from '../../../contexts/ConnectionsContext';
import { PageHeader } from '../../../components/layout/PageHeader';

export const TikTokConfig = () => {
  const { addConnection, removeConnection, getConnectionByPlatform, isConnecting } = useConnections();
  const [accessToken, setAccessToken] = useState('');
  const [advertiserId, setAdvertiserId] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const existingConnection = getConnectionByPlatform('tiktok');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !advertiserId) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await addConnection('tiktok', { accessToken, advertiserId, refreshToken, webhookSecret, displayName: `TikTok #${advertiserId.slice(-6)}` });
      setAccessToken(''); setAdvertiserId(''); setRefreshToken(''); setWebhookSecret('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al conectar TikTok.');
    } finally { setLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;
    setLoading(true);
    try { await removeConnection(existingConnection.id); }
    catch (err: any) { setError('Error al desconectar.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full animate-in fade-in duration-500 flex flex-col gap-1">
      <PageHeader title="Conexión de" highlight="TikTok" description="Conecta tu cuenta de TikTok Business para automatización de mensajes directos." icon={FaTiktok}
        action={existingConnection ? (
          <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Cuenta Conectada
          </div>
        ) : (
          <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-white text-red-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Sin Conexión
          </div>
        )}
      />
      <div className="flex-1 bg-white dark:bg-dark-card/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-lg flex flex-col min-h-0">
        <div className="flex-1 p-5 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
            <div className="xl:col-span-1">
              {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" /><p className="text-sm text-red-400">{error}</p></div>}
              {success && <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" /><p className="text-sm text-emerald-400">¡TikTok conectado!</p></div>}

              {existingConnection ? (
                <div className="space-y-6">
                  <div className="p-6/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-gray-500/20">
                        <FaTiktok size={32} color="white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Cuenta Conectada</h3>
                        <p className="text-sm text-slate-500">{existingConnection.display_name}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                        <p className="text-lg font-bold text-emerald-500">Activo</p>
                      </div>
                      {existingConnection.connected_at && (
                        <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conectado desde</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{new Date(existingConnection.connected_at).toLocaleString('es-PE')}</p>
                        </div>
                      )}
                    </div>
                    <button onClick={handleDisconnect} disabled={loading}
                      className="mt-6 w-full h-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50">
                      {loading ? 'Desconectando...' : 'Desconectar Cuenta'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-black to-gray-800 rounded-lg shadow-lg shadow-gray-500/20">
                        <FaTiktok size={20} color="white" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Configurar TikTok Business API</h4>
                    </div>
                    <form onSubmit={handleConnect} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Token *</label>
                        <textarea value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="act.example..." rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all resize-none" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Advertiser ID *</label>
                        <input type="text" value={advertiserId} onChange={e => setAdvertiserId(e.target.value)} placeholder="1234567890123456789"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all" required />
                        <p className="text-[10px] text-slate-500 mt-1">ID de tu cuenta publicitaria de TikTok Business</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Refresh Token <span className="font-normal">(opcional)</span></label>
                        <input type="text" value={refreshToken} onChange={e => setRefreshToken(e.target.value)} placeholder="rft.example..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Webhook Secret <span className="font-normal">(opcional)</span></label>
                        <input type="text" value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} placeholder="mi_secreto_webhook"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all" />
                      </div>
                      <button type="submit" disabled={loading || isConnecting('tiktok')}
                        className="w-full h-12 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50">
                        {loading || isConnecting('tiktok') ? 'Conectando...' : 'Conectar TikTok Business'}
                      </button>
                    </form>
                  </div>
                  <div className="p-60/5 rounded-3xl border border-gray-500/10 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">📋 Cómo obtener las credenciales</h4>
                    <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside">
                      <li>Ve a <strong>TikTok for Developers</strong> y crea una aplicación</li>
                      <li>Solicita acceso a la <strong>Direct Message API</strong></li>
                      <li>Genera un <strong>Access Token</strong> con los permisos requeridos</li>
                      <li>Obtén tu <strong>Advertiser ID</strong> desde el Business Center</li>
                    </ol>
                    <a href="https://developers.tiktok.com/doc/overview" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 font-semibold mt-2 transition-colors">
                      Ver documentación oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
              <div className="p-6/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-500 rounded-lg text-black shadow-lg shadow-accent-500/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Estado del Ecosistema</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Plataforma</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">TikTok</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Método</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">API Oficial</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-accent-500/5 border border-accent-500/10">
                    <div className="w-6 h-6 flex-shrink-0 bg-accent-500 text-black text-[10px] font-black rounded flex items-center justify-center">01</div>
                    <p><span className="font-black text-slate-900 dark:text-white block uppercase mb-0.5">Automatización</span>El bot podrá contestar a cualquier mensaje en esta cuenta de TikTok.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

