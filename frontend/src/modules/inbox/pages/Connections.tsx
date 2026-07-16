import { Link } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Loader2, ArrowRight, Sun, Moon, Plug, PlugZap, Wifi, WifiOff } from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger, FaTiktok } from "react-icons/fa";
import { useConnections } from '../../../contexts/ConnectionsContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { cn } from '../../../utils/cn';

const platforms = [
  { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-500', description: 'Conexión con WhatsApp Business API (QR)', route: '/whatsapp-qr' },
  { id: 'telegram', name: 'Telegram', icon: FaTelegram, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-500', description: 'Bot de Telegram (Token de Bot)', route: '/telegram-config' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'from-pink-500 to-purple-600', shadow: 'shadow-pink-500/20', bg: 'bg-pink-500/10', text: 'text-pink-500', description: 'Instagram Messaging API (OAuth)', route: '/instagram-config' },
  { id: 'facebook_messenger', name: 'Facebook Messenger', icon: FaFacebookMessenger, color: 'from-blue-600 to-blue-700', shadow: 'shadow-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-500', description: 'Facebook Messenger Platform (OAuth)', route: '/facebook-config' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'from-black to-gray-800', shadow: 'shadow-gray-500/20', bg: 'bg-gray-500/10', text: 'text-gray-500', description: 'TikTok Direct Messages (OAuth)', route: '/tiktok-config' }
];

export const Connections = () => {
  const { connections, removeConnection, isConnecting } = useConnections();
  const { theme, toggleTheme } = useTheme();

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) window.location.href = platform.route;
  };

  const handleDisconnect = async (connectionId: string) => {
    await removeConnection(connectionId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'connecting': return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error_sync': return <XCircle className="w-5 h-5 text-orange-500" />;
      default: return <WifiOff className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Error de conexión';
      case 'pending': return 'Pendiente';
      case 'error_sync': return 'Error de sincronización';
      default: return 'Desconectado';
    }
  };

  return (
    <div className="h-full flex flex-col transition-colors duration-300">
      <div className="border-b border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Conexiones</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Gestiona tus integraciones con redes sociales</p>
            </div>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all duration-300" aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 p-4 bg-gradient-to-r from-accent-500/10 to-emerald-500/10 border border-accent-500/20 rounded-xl flex items-start gap-3">
          <Plug className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="text-accent-600 dark:text-accent-500 font-black uppercase text-[10px] tracking-widest">Los bots y automatizaciones (flows) funcionan para todas las redes sociales.</span>
            <br />Una vez conectada una plataforma, puedes usar el <Link to="/builder" className="text-accent-500 hover:text-accent-400 font-bold underline underline-offset-2">Constructor de Bots</Link> para crear automatizaciones que funcionen en todas tus conexiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const connection = connections.find(c => c.platform_type === platform.id);

            return (
              <div key={platform.id} className="group bg-white dark:bg-dark-card/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${platform.color} ${platform.shadow} shadow-lg`}>
                    <Icon size={22} color="white" />
                  </div>
                  {connection && getStatusIcon(connection.status)}
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 relative z-10">{platform.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 relative z-10">{platform.description}</p>

                {connection ? (
                  <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{connection.display_name}</span>
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md',
                        connection.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' :
                        connection.status === 'connecting' ? 'bg-amber-500/10 text-amber-500' :
                        connection.status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
                      )}>{getStatusText(connection.status)}</span>
                    </div>
                    {connection.phone_number && <p className="text-xs text-slate-400 mt-1">{connection.phone_number}</p>}
                  </div>
                ) : (
                  <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative z-10">
                    <p className="text-xs text-slate-400 text-center font-semibold">Sin conexión activa</p>
                  </div>
                )}

                <div className="relative z-10">
                  {connection?.status === 'connected' ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleDisconnect(connection.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold text-red-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        Desconectar
                      </button>
                      <Link to={platform.route}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        Gestionar <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <button onClick={() => handleConnect(platform.id)} disabled={isConnecting(platform.id as any)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-white dark:hover:from-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white dark:text-black transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                      {isConnecting(platform.id as any) ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Conectando...</>
                      ) : (
                        <><Plus className="w-4 h-4" /> Conectar {platform.name}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
