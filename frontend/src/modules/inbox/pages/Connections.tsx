import { Link } from 'react-router-dom';
import {
  Plus, CheckCircle,
  XCircle, Loader2, ArrowRight, Sun, Moon
} from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger, FaTiktok } from "react-icons/fa";
import { useConnections } from '../../../contexts/ConnectionsContext';
import { useTheme } from '../../../contexts/ThemeContext';

const platforms = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: 'from-green-500 to-green-600',
    description: 'ConexiÃ³n con WhatsApp Business API (QR)',
    route: '/whatsapp-qr'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: FaTelegram,
    color: 'from-blue-500 to-blue-600',
    description: 'Bot de Telegram (Token de Bot)',
    route: '/telegram-config'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: 'from-pink-500 to-purple-600',
    description: 'Instagram Messaging API (OAuth)',
    route: '/instagram-config'
  },
  {
    id: 'facebook_messenger',
    name: 'Facebook Messenger',
    icon: FaFacebookMessenger,
    color: 'from-blue-600 to-blue-700',
    description: 'Facebook Messenger Platform (OAuth)',
    route: '/facebook-config'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: FaTiktok,
    color: 'from-black to-gray-800',
    description: 'TikTok Direct Messages (OAuth)',
    route: '/tiktok-config'
  }
];

export const Connections = () => {
  const { connections, removeConnection, isConnecting } = useConnections();
  const { theme, toggleTheme } = useTheme();

  const handleConnect = (platformId: string) => {
    // Navigate to the specific connection page for this platform
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      window.location.href = platform.route;
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    await removeConnection(connectionId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error_sync':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Error de conexiÃ³n';
      case 'pending':
        return 'Pendiente';
      case 'error_sync':
        return 'Error de sincronizaciÃ³n';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="h-full flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Conexiones
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Gestiona tus integraciones con redes sociales
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info banner */}
        <div className="mb-8 p-4 bg-accent-500/10 border border-accent-500/20 rounded-xl">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="text-accent-600 dark:text-accent-500 font-semibold">â„¹ï¸ Los bots y automatizaciones (flows) funcionan para todas las redes sociales.</span>
            Una vez conectada una plataforma, puedes usar el Constructor de Bots para crear automatizaciones que funcionen en todas tus conexiones.
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const connection = connections.find(c => c.platform_type === platform.id);

            return (
              <div
                key={platform.id}
                className="group relative card-panel p-6 hover:border-accent-500/50 transition-all duration-300"
              >
                {/* Platform Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${platform.color} shadow-lg`}>
                    <Icon size={24} color="white" />
                  </div>
                  {connection && getStatusIcon(connection.status)}
                </div>

                {/* Platform Info */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {platform.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {platform.description}
                </p>

                {/* Connection Status */}
                {connection ? (
                  <div className="mb-4 p-3 bg-slate-100 dark:bg-dark-card rounded-xl border border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {connection.display_name}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {getStatusText(connection.status)}
                      </span>
                    </div>
                    {connection.phone_number && (
                      <p className="text-xs text-slate-400 mt-1">
                        {connection.phone_number}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-3 dark:bg-dark-card rounded-xl border border-dashed border-slate-300 dark:border-white/10">
                    <p className="text-xs text-slate-500 text-center font-medium">
                      Sin conexiÃ³n activa
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {connection?.status === 'connected' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDisconnect(connection.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 transition-all duration-300"
                    >
                      Desconectar
                    </button>
                    <Link
                      to={platform.route}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all duration-300"
                    >
                      Gestionar
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting(platform.id as any)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white dark:text-black transition-all duration-300 shadow-md"
                  >
                    {isConnecting(platform.id as any) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Conectar {platform.name}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

