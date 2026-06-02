import { useState } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { useConnections } from '../contexts/ConnectionsContext';
import { PageHeader } from '../components/layout/PageHeader';

export const InstagramConfig = () => {
  const { addConnection, removeConnection, getConnectionByPlatform, isConnecting } = useConnections();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const existingConnection = getConnectionByPlatform('instagram');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      // Simulate OAuth/login process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await addConnection('instagram', {
        displayName: `@${username}`,
        username: username
      });
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Error connecting Instagram:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;
    setLoading(true);
    try {
      await removeConnection(existingConnection.id);
    } catch (error) {
      console.error('Error disconnecting Instagram:', error);
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
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Cuenta Conectada
            </div>
          ) : (
            <div className="px-4 h-10 rounded-xl flex items-center gap-2 border-amber-500/20 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Sin Conexión
            </div>
          )
        }
      />

      <div className="flex-1 bg-white dark:bg-[#11141b]/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-lg relative overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 p-5 lg:p-8 overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-2xl mx-auto">
            {existingConnection ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-500/20">
                      <FaInstagram className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Cuenta Conectada</h3>
                      <p className="text-sm text-slate-500">{existingConnection.display_name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Username</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{existingConnection.username}</p>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                      <p className="text-lg font-bold text-emerald-500">Activo</p>
                    </div>
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
                    Tu cuenta de Instagram Business está conectada. Los flujos de automatización creados en el Constructor de Bots funcionarán automáticamente con esta conexión.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg text-white shadow-lg shadow-pink-500/20">
                      <FaInstagram className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Conectar Cuenta</h4>
                  </div>

                  <form onSubmit={handleConnect} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Username de Instagram
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@tu_usuario"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || isConnecting('instagram')}
                      className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading || isConnecting('instagram') ? 'Conectando...' : 'Conectar con Instagram'}
                    </button>
                  </form>
                </div>

                <div className="p-6 bg-pink-500/5 rounded-3xl border border-pink-500/10">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">🔒 Seguridad</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tus credenciales están encriptadas y seguras. Solo usamos tu cuenta para enviar respuestas automáticas a través de los flujos que configures.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
