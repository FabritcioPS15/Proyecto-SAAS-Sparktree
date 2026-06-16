import { useState } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { ExternalLink, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useConnections } from '../contexts/ConnectionsContext';
import { PageHeader } from '../components/layout/PageHeader';

export const InstagramConfig = () => {
  const { addConnection, removeConnection, getConnectionByPlatform, isConnecting } = useConnections();

  const [instagramBusinessAccountId, setInstagramBusinessAccountId] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const existingConnection = getConnectionByPlatform('instagram');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramBusinessAccountId || !facebookPageId || !accessToken) return;

    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await addConnection('instagram', {
        instagramBusinessAccountId,
        facebookPageId,
        accessToken,
        displayName: `Instagram Business #${instagramBusinessAccountId.slice(-6)}`
      });
      setInstagramBusinessAccountId('');
      setFacebookPageId('');
      setAccessToken('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al conectar Instagram. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;
    setLoading(true);
    setError('');
    try {
      await removeConnection(existingConnection.id);
    } catch (err: any) {
      setError('Error al desconectar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full animate-in fade-in duration-500 flex flex-col gap-1">
      <PageHeader
        title="Conexión de"
        highlight="Instagram"
        description="Conecta tu cuenta de Instagram Business para automatización de mensajes."
        icon={FaInstagram}
        action={
          existingConnection ? (
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Cuenta Conectada
            </div>
          ) : (
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Sin Conexión
            </div>
          )
        }
      />

      <div className="flex-1 bg-white dark:bg-[#11141b]/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-lg relative overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 p-5 lg:p-8 overflow-y-auto custom-scrollbar relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
            <div className="xl:col-span-1">

              {/* Error banner */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-400">¡Instagram conectado correctamente!</p>
                </div>
              )}

              {existingConnection ? (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-500/20">
                        <FaInstagram size={32} color="white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Cuenta Conectada</h3>
                        <p className="text-sm text-slate-500">{existingConnection.display_name}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID de Cuenta</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{existingConnection.username || existingConnection.display_name}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                        <p className="text-lg font-bold text-emerald-500">Activo</p>
                      </div>
                      {existingConnection.connected_at && (
                        <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conectado desde</p>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {new Date(existingConnection.connected_at).toLocaleString('es-PE')}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="mt-6 w-full h-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {loading ? 'Desconectando...' : 'Desconectar Cuenta'}
                    </button>
                  </div>

                  <div className="p-6 bg-pink-500/5 rounded-3xl border border-pink-500/10">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">ℹ️ Información</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Tu cuenta de Instagram Business está conectada vía Messenger API. Los flujos de automatización funcionarán automáticamente con esta conexión.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-lg shadow-pink-500/20">
                        <FaInstagram size={20} color="white" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Configurar Instagram Business API</h4>
                    </div>

                    <form onSubmit={handleConnect} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Instagram Business Account ID
                        </label>
                        <input
                          type="text"
                          value={instagramBusinessAccountId}
                          onChange={(e) => setInstagramBusinessAccountId(e.target.value)}
                          placeholder="123456789012345"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                          required
                        />
                        <p className="text-[10px] text-slate-500 mt-1">El ID numérico de tu cuenta de Instagram Business</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Facebook Page ID
                        </label>
                        <input
                          type="text"
                          value={facebookPageId}
                          onChange={(e) => setFacebookPageId(e.target.value)}
                          placeholder="987654321098765"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                          required
                        />
                        <p className="text-[10px] text-slate-500 mt-1">El ID de la Página de Facebook vinculada</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Page Access Token
                        </label>
                        <textarea
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value)}
                          placeholder="EAABsbCS..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none font-mono text-xs"
                          required
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Token de acceso permanente con permisos de Messenger API</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || isConnecting('instagram')}
                        className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading || isConnecting('instagram') ? 'Conectando...' : 'Conectar Instagram Business'}
                      </button>
                    </form>
                  </div>

                  <div className="p-6 bg-pink-500/5 rounded-3xl border border-pink-500/10 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">📋 Cómo obtener las credenciales</h4>
                    <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed list-decimal list-inside">
                      <li>Ve a <strong>Meta for Developers</strong> y crea una app de tipo Business</li>
                      <li>Agrega el producto <strong>Messenger</strong> a tu app</li>
                      <li>Vincula tu Página de Facebook e Instagram Business</li>
                      <li>Genera un <strong>Page Access Token</strong> permanente</li>
                      <li>Copia el <strong>Instagram Business Account ID</strong> desde la configuración de la cuenta</li>
                    </ol>
                    <a
                      href="https://developers.facebook.com/docs/messenger-platform/instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-pink-500 hover:text-pink-400 font-semibold mt-2 transition-colors"
                    >
                      Ver documentación oficial
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
              <div className="p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-500 rounded-lg text-black shadow-lg shadow-accent-500/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Estado del Ecosistema</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Plataforma</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">Instagram</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Método</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">API Oficial</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-accent-500/5 border border-accent-500/10">
                    <div className="w-6 h-6 flex-shrink-0 bg-accent-500 text-black text-[10px] font-black rounded flex items-center justify-center">01</div>
                    <p><span className="font-black text-slate-900 dark:text-white block uppercase mb-0.5">Automatización</span>El bot podrá contestar a cualquier mensaje en esta cuenta de Instagram Business.</p>
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
