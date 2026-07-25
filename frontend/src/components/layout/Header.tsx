import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Moon, Sun, Menu, LogOut, User, Settings as SettingsIcon,
  ChevronDown, Building2, Users, Bell, Search, Plus, HelpCircle, CreditCard,
  MessageSquare, Bot, Sparkles, Share2, Palette, Tag, BookOpen, FileText
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useCustomization, STATUS_KEYS, STATUS_GROUPS, BADGE_VARIANTS } from '../../contexts/CustomizationContext';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { Modal } from '../ui/Modal';

interface HeaderProps {
  onMenuClick?: () => void;
}

const iconBtn = "p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-[#242424] hover:text-slate-700 dark:hover:text-accent-300 transition-all";

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, activeProfile, clearProfile } = useAuth();
  const { connections } = useConnections();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState('accent');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();
  const {
    accentColor, setAccentColor,
    customAccentHex, setCustomAccentHex,
    tableDensity, setTableDensity,
    layoutMode, setLayoutMode,
    cardStyle, setCardStyle,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    radiusSize, setRadiusSize,
    statusColors, setStatusColor,
  } = useCustomization();
  const navigate = useNavigate();

  const platformIcons: Record<string, any> = {
    whatsapp: FaWhatsapp,
    telegram: FaTelegram,
    instagram: FaInstagram,
    facebook_messenger: FaFacebookMessenger,
    tiktok: SiTiktok,
  };

  const platformRoutes: Record<string, string> = {
    whatsapp: '/whatsapp-qr',
    telegram: '/telegram-config',
    instagram: '/instagram-config',
    facebook_messenger: '/facebook-config',
    tiktok: '/tiktok-config',
  };

  const platformColors: Record<string, string> = {
    whatsapp: 'text-emerald-500',
    telegram: 'text-sky-500',
    instagram: 'text-pink-500',
    facebook_messenger: 'text-blue-500',
    tiktok: 'text-slate-900 dark:text-white',
  };

  const quickActions = [
    { icon: Bot, label: 'Crear Flujo', path: '/flow-manager' },
    { icon: Tag, label: 'Crear Promoción', path: '/promotions' },
    { icon: BookOpen, label: 'Crear Catálogo', path: '/catalogs' },
    { icon: FileText, label: 'Crear Plantilla', path: '/message-templates' },
  ];

  const helpContent = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return { title: 'Dashboard', description: 'Resumen general de tu negocio con métricas clave, actividad reciente y gráficos de rendimiento.' };
    if (path.startsWith('/clients')) return { title: 'Clientes', description: 'Gestiona tu base de clientes: crea, edita, importa y organiza contactos. Visualiza el historial de interacciones.' };
    if (path.startsWith('/conversations')) return { title: 'Conversaciones', description: 'Bandeja unificada de conversaciones. Atiende chats de WhatsApp, Telegram, Instagram, Facebook y TikTok en un solo lugar.' };
    if (path.startsWith('/catalogs')) return { title: 'Catálogos', description: 'Crea y administra catálogos de productos o servicios para compartir con tus clientes.' };
    if (path.startsWith('/leads')) return { title: 'Potenciales', description: 'Administra leads y oportunidades de venta. Haz seguimiento del pipeline comercial.' };
    if (path.startsWith('/analytics')) return { title: 'Analíticas', description: 'Métricas e indicadores de rendimiento. Analiza el desempeño de tus canales de atención.' };
    if (path.startsWith('/reports')) return { title: 'Reportes', description: 'Genera reportes personalizados con datos de ventas, clientes y atención.' };
    if (path.startsWith('/flow-manager') || path.startsWith('/flows')) return { title: 'Constructor de Bots', description: 'Diseña flujos de conversación automatizados con un editor visual. Crea chatbots sin código.' };
    if (path.startsWith('/message-templates')) return { title: 'Plantillas', description: 'Crea y gestiona plantillas de mensajes para respuestas rápidas y campañas.' };
    if (path.startsWith('/assignment-rules')) return { title: 'Reglas de Asignación', description: 'Configura reglas para asignar conversaciones a agentes según criterios como carga de trabajo o especialidad.' };
    if (path.startsWith('/business-hours')) return { title: 'Horarios de Atención', description: 'Define los horarios laborales y reglas de disponibilidad para la atención al cliente.' };
    if (path.startsWith('/support')) return { title: 'Atención al Cliente', description: 'Central de atención: gestiona agentes, base de conocimiento y herramientas de soporte.' };
    if (path.startsWith('/agents')) return { title: 'Agentes', description: 'Administra los agentes de soporte, sus roles y disponibilidad.' };
    if (path.startsWith('/knowledge-base')) return { title: 'Base de Conocimiento', description: 'Crea artículos y guías de ayuda para respuestas rápidas y auto-servicio.' };
    if (path.startsWith('/email')) return { title: 'Correo', description: 'Bandeja de correo electrónico integrada. Gestiona emails desde la plataforma.' };
    if (path.startsWith('/calendar')) return { title: 'Calendario', description: 'Calendario compartido para agendar citas, eventos y tareas del equipo.' };
    if (path.startsWith('/orders')) return { title: 'Pedidos', description: 'Gestiona los pedidos recibidos: estado, seguimiento y historial.' };
    if (path.startsWith('/promotions')) return { title: 'Promociones', description: 'Crea y administra campañas promocionales y descuentos.' };
    if (path.startsWith('/crm') || path.startsWith('/pipeline')) return { title: 'CRM / Pipeline', description: 'Visualiza y gestiona tu pipeline de ventas con tablero kanban.' };
    if (path.startsWith('/notifications')) return { title: 'Notificaciones', description: 'Centro de notificaciones del sistema. Configura alertas y preferencias.' };
    if (path.startsWith('/webhooks')) return { title: 'Webhooks / API', description: 'Configura webhooks para integrar eventos de la plataforma con sistemas externos.' };
    if (path.startsWith('/roles-permissions')) return { title: 'Roles y Permisos', description: 'Administra roles de usuario y permisos de acceso a las diferentes secciones.' };
    if (path.startsWith('/audit-logs')) return { title: 'Auditoría', description: 'Registro de actividades del sistema para seguimiento y cumplimiento.' };
    if (path.startsWith('/connections') || path.startsWith('/whatsapp-qr') || path.startsWith('/telegram-config') || path.startsWith('/instagram-config') || path.startsWith('/facebook-config') || path.startsWith('/tiktok-config') || path.startsWith('/multi-whatsapp')) return { title: 'Conexiones', description: 'Conecta y administra tus canales de comunicación: WhatsApp, Telegram, Instagram, Facebook Messenger y TikTok.' };
    if (path.startsWith('/billing')) return { title: 'Facturación', description: 'Gestiona planes de suscripción, métodos de pago y consume de la plataforma.' };
    if (path.startsWith('/admin/organizations')) return { title: 'Organizaciones', description: 'Administración de organizaciones: crea, edita y gestiona empresas en la plataforma.' };
    if (path.startsWith('/admin/staff')) return { title: 'Equipo', description: 'Gestiona los miembros de tu equipo, roles y permisos.' };
    if (path.startsWith('/superadmin/companies')) return { title: 'Todas las Empresas', description: 'Panel superadmin: visualiza y administra todas las empresas registradas.' };
    if (path.startsWith('/superadmin/business-metrics')) return { title: 'Métricas del Negocio', description: 'Métricas globales del negocio para superadministradores.' };
    if (path.startsWith('/superadmin/system-logs')) return { title: 'Logs del Sistema', description: 'Registros técnicos del sistema para diagnóstico y monitoreo.' };
    if (path.startsWith('/ai/providers')) return { title: 'Proveedores LLM', description: 'Configura proveedores de inteligencia artificial para funciones avanzadas.' };
    if (path.startsWith('/settings')) return { title: 'Ajustes', description: 'Configuración general de tu cuenta y preferencias de la plataforma.' };
    return { title: 'Ayuda', description: 'Consulta la documentación para aprender a usar la plataforma.' };
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-[70] bg-[#F8FAFC] dark:bg-[#1a1a1a] transition-colors duration-300 shadow-sm">
      <div className="flex items-center justify-between h-14 px-6">

        {/* Left: mobile menu + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Desktop search */}
          <div className="hidden md:block">
            <button
              onClick={() => { setIsSearchOpen(false); setIsSocialOpen(false); setIsQuickActionsOpen(false); setIsProfileOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-accent-300 hover:border-slate-300 dark:hover:border-slate-700 transition-all w-56"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs">Buscar...</span>
              <span className="ml-auto text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md">⌘K</span>
            </button>
          </div>

          {/* Mobile search icon + dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={() => { setIsSearchOpen(!isSearchOpen); setIsSocialOpen(false); setIsQuickActionsOpen(false); setIsProfileOpen(false); }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
            {isSearchOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSearchOpen(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    autoFocus
                    className="w-full px-4 py-3 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: channels + actions + profile */}
        <div className="flex items-center gap-1.5">

          {/* Desktop channel pills */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-xl">
            {Object.keys(platformIcons).map((platform) => {
              const Icon = platformIcons[platform];
              const conn = connections.find((c) => c.platform_type === platform);
              const isConnected = conn?.status === 'connected';
              const route = platformRoutes[platform];
              const color = platformColors[platform];

              return (
                <button
                  key={platform}
                  onClick={() => navigate(route)}
                  title={`${platform} — ${isConnected ? 'Conectado' : 'Desconectado'}`}
                  className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon className={`w-4 h-4 transition-colors ${isConnected ? color : 'text-slate-300 dark:text-slate-700'}`} />
                  <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-[#242424] ${isConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </button>
              );
            })}
          </div>

          {/* Mobile social dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={() => { setIsSocialOpen(!isSocialOpen); setIsSearchOpen(false); setIsQuickActionsOpen(false); setIsProfileOpen(false); }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              title="Redes"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isSocialOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSocialOpen(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-1 p-2">
                    {Object.keys(platformIcons).map((platform) => {
                      const Icon = platformIcons[platform];
                      const conn = connections.find((c) => c.platform_type === platform);
                      const isConnected = conn?.status === 'connected';
                      const route = platformRoutes[platform];
                      const color = platformColors[platform];
                      return (
                        <button
                          key={platform}
                          onClick={() => { navigate(route); setIsSocialOpen(false); }}
                          title={`${platform} — ${isConnected ? 'Conectado' : 'Desconectado'}`}
                          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Icon className={`w-5 h-5 transition-colors ${isConnected ? color : 'text-slate-300 dark:text-slate-700'}`} />
                          <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-white dark:border-[#242424] ${isConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions dropdown (replaces single Create Flow button) */}
          <div className="relative">
            <button
              onClick={() => { setIsQuickActionsOpen(!isQuickActionsOpen); setIsSearchOpen(false); setIsSocialOpen(false); setIsProfileOpen(false); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Acciones
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickActionsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsQuickActionsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1.5 space-y-0.5">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.path}
                          onClick={() => { navigate(action.path); setIsQuickActionsOpen(false); }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <Icon className="w-3 h-3" />
                          </span>
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Help -> Consultas */}
          <div className="relative">
            <button
              onClick={() => { setIsHelpOpen(!isHelpOpen); setIsSearchOpen(false); setIsSocialOpen(false); setIsQuickActionsOpen(false); setIsProfileOpen(false); }}
              className={iconBtn}
              title="Ayuda"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {isHelpOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsHelpOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-accent-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{helpContent.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {helpContent.description}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={iconBtn}
            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications (consistent with other icon buttons) */}
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSearchOpen(false); setIsSocialOpen(false); setIsQuickActionsOpen(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white dark:hover:bg-[#242424] border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333333] transition-all"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=random`}
                alt="avatar"
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none truncate max-w-[90px]">
                  {activeProfile?.name || user?.full_name || 'Usuario'}
                </p>
                <p className="text-[10px] font-medium text-slate-500 capitalize leading-none mt-0.5">
                  {activeProfile ? 'Equipo' : ({
                    super_admin: 'Super Admin',
                    admin: 'Administrador',
                    empresa: 'Empresa',
                    staff: 'Staff',
                    agent: 'Agente',
                  }[user?.role || ''] || 'Usuario')}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#242424] border border-[#E5E7EB] dark:border-[#333333] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-4 border-b border-[#E5E7EB] dark:border-[#333333]">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=random`}
                        alt="avatar"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                          {activeProfile?.name || user?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[160px]">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    {user?.role === 'empresa' && activeProfile && (
                      <MenuItem icon={<Users className="w-4 h-4" />} label="Cambiar Perfil" onClick={() => { clearProfile(); setIsProfileOpen(false); }} />
                    )}
                    <MenuItem icon={<User className="w-4 h-4" />} label="Mi Perfil y Ajustes" onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} />
                    <MenuItem icon={theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} label={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'} onClick={(e) => { e.stopPropagation(); toggleTheme(); }} />
                    <MenuItem icon={<CreditCard className="w-4 h-4" />} label="Facturación" onClick={() => { navigate('/billing'); setIsProfileOpen(false); }} />
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <MenuItem icon={<Palette className="w-4 h-4" />} label="Personalizar" onClick={() => { setIsCustomizeOpen(true); setIsProfileOpen(false); }} />
                    )}

                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <>
                        <div className="my-1 border-t border-[#E5E7EB] dark:border-[#333333]" />
                        <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Administración</p>
                        <MenuItem icon={<Building2 className="w-4 h-4" />} label="Organizaciones" onClick={() => { navigate('/admin/organizations'); setIsProfileOpen(false); }} />
                        <MenuItem icon={<Users className="w-4 h-4" />} label="Personal (Staff)" onClick={() => { navigate('/admin/staff'); setIsProfileOpen(false); }} />
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#E5E7EB] dark:border-[#333333] p-2">
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200/60 dark:border-white/5" />

      {/* Customization Modal */}
      <Modal
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title="Personalizar"
        subtitle="Adapta la interfaz a tu estilo"
        icon={<Palette className="w-5 h-5 text-accent-500" />}
        size="md"
      >
        <div className="flex flex-col h-[580px]">
          {/* Tab bar */}
          <div className="flex gap-1 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-white/[0.02]">
            {[
              { key: 'accent', label: 'Color Acento', icon: '🎨' },
              { key: 'status', label: 'Estados', icon: '🏷️' },
              { key: 'appearance', label: 'Apariencia', icon: '✨' },
              { key: 'preview', label: 'Vista Previa', icon: '👁️' },
            ].map((tab) => {
              const isActive = customizeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCustomizeTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-accent-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* TAB: Color Acento */}
            {customizeTab === 'accent' && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                  COLOR PRINCIPAL
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { key: 'emerald', class: 'bg-emerald-500', label: 'Esmeralda' },
                    { key: 'blue', class: 'bg-blue-500', label: 'Azul' },
                    { key: 'violet', class: 'bg-violet-500', label: 'Violeta' },
                    { key: 'rose', class: 'bg-rose-500', label: 'Rosa' },
                    { key: 'amber', class: 'bg-amber-500', label: 'Ámbar' },
                    { key: 'cyan', class: 'bg-cyan-500', label: 'Cian' },
                  ].map(({ key, className: bgClass, label }) => (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      title={label}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                        accentColor === key
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#242424] ring-slate-900 dark:ring-white bg-slate-50 dark:bg-white/5'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl ${bgClass} shadow-sm transition-transform ${accentColor === key ? 'scale-110' : ''}`} />
                      <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative cursor-pointer">
                    <input
                      type="color"
                      value={accentColor === 'custom' ? customAccentHex : '#10b981'}
                      onChange={(e) => { setCustomAccentHex(e.target.value); setAccentColor('custom'); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      accentColor === 'custom'
                        ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#242424] ring-slate-900 dark:ring-white bg-slate-50 dark:bg-white/5'
                        : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}>
                      <span className="w-5 h-5 rounded" style={{ backgroundColor: accentColor === 'custom' ? customAccentHex : '#10b981' }} />
                      Personalizado
                    </span>
                  </label>
                  {accentColor === 'custom' && (
                    <span className="text-[9px] font-mono text-slate-400">{customAccentHex}</span>
                  )}
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-6">
                  <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                  MUESTRA DE TONOS
                </p>
                <div className="flex gap-1.5">
                  {['50','100','200','300','400','500','600','700','800','900'].map((shade) => (
                    <div
                      key={shade}
                      className="flex-1 h-8 rounded-lg"
                      style={{ backgroundColor: `rgb(var(--accent-${shade}) / 1)` }}
                      title={`${shade}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Estados */}
            {customizeTab === 'status' && (
              <div className="space-y-4">
                {STATUS_GROUPS.map((group) => (
                  <div key={group.name}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                      {group.name}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {group.keys.map((status) => {
                        const labels: Record<string, string> = {
                          pending: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado', refunded: 'Reembolsado', overdue: 'Vencido',
                          processing: 'Procesando', sent: 'Enviado', delivered: 'Entregado', returned: 'Devuelto',
                          active: 'Activo', inactive: 'Inactivo', error: 'Error', success: 'Éxito', warning: 'Advertencia', info: 'Info',
                          connected: 'Conectado', connecting: 'Conectando', disconnected: 'Desconectado',
                          draft: 'Borrador', accepted: 'Aceptado', rejected: 'Rechazado', expired: 'Expirado',
                        };
                        const currentVariant = statusColors[status] || 'warning';
                        return (
                          <div key={status} className="flex items-center gap-2 px-1">
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 w-24 shrink-0">{labels[status] || status}</span>
                            <div className="flex gap-1">
                              {BADGE_VARIANTS.map((v) => {
                                const colorMap: Record<string, string> = {
                                  primary: 'bg-accent-500', success: 'bg-emerald-500', warning: 'bg-amber-500',
                                  danger: 'bg-red-500', info: 'bg-sky-500', default: 'bg-slate-400',
                                };
                                return (
                                  <button
                                    key={v}
                                    onClick={() => setStatusColor(status, v)}
                                    className={`w-5 h-5 rounded-full ${colorMap[v]} transition-all ${
                                      currentVariant === v ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#242424] ring-slate-900 dark:ring-white scale-110' : 'opacity-40 hover:opacity-80'
                                    }`}
                                    title={v}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Apariencia */}
            {customizeTab === 'appearance' && (
              <div className="space-y-5">
                {/* Layout */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                    LAYOUT
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'fluid', label: 'Fluido', desc: 'Ancho completo' },
                      { key: 'boxed', label: 'Centrado', desc: 'Máximo 1400px' },
                    ].map(({ key, label, desc }) => (
                      <button
                        key={key}
                        onClick={() => setLayoutMode(key)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                          layoutMode === key
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#242424] ring-slate-900 dark:ring-white bg-slate-50 dark:bg-white/5'
                            : 'bg-slate-100/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="w-full h-6 rounded-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                          <div className={`h-1 rounded-full bg-slate-300 dark:bg-slate-600 ${key === 'boxed' ? 'w-3/5' : 'w-full mx-1'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 -mt-1">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Densidad + Fuente */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                      DENSIDAD
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {['compact', 'normal', 'spacious'].map((key) => {
                        const labels: Record<string, string> = { compact: 'Compacta', normal: 'Normal', spacious: 'Espaciosa' };
                        return (
                          <button
                            key={key}
                            onClick={() => setTableDensity(key)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                              tableDensity === key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                                : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded ${key === 'compact' ? 'bg-slate-400' : key === 'normal' ? 'bg-slate-500' : 'bg-slate-600'} ${tableDensity === key ? 'bg-white dark:bg-black' : ''}`} />
                            {labels[key]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                      TAMAÑO FUENTE
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { key: 'small', label: 'Pequeña', sample: 'Aa' },
                        { key: 'normal', label: 'Normal', sample: 'Aa' },
                        { key: 'large', label: 'Grande', sample: 'Aa' },
                      ].map(({ key, label, sample }) => (
                        <button
                          key={key}
                          onClick={() => setFontSize(key)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            fontSize === key
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                              : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className={`font-black ${key === 'small' ? 'text-xs' : key === 'normal' ? 'text-sm' : 'text-base'} ${fontSize === key ? 'text-white dark:text-black' : 'text-slate-500 dark:text-slate-400'}`}>
                            {sample}
                          </span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tarjetas + Redondeo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                      TARJETAS
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { key: 'bordered', label: 'Con borde', klass: 'border border-slate-300 dark:border-slate-600' },
                        { key: 'flat', label: 'Sin borde', klass: 'shadow-sm' },
                        { key: 'glass', label: 'Vidrio', klass: 'bg-white/50 dark:bg-white/5 backdrop-blur' },
                      ].map(({ key, label, klass }) => (
                        <button
                          key={key}
                          onClick={() => setCardStyle(key)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            cardStyle === key
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                              : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className={`w-4 h-3 rounded ${klass} ${cardStyle === key ? 'border-white dark:border-black' : ''}`} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                      REDONDEO
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { key: 'small', label: 'Pequeño', klass: 'rounded-md' },
                        { key: 'normal', label: 'Normal', klass: 'rounded-xl' },
                        { key: 'large', label: 'Grande', klass: 'rounded-3xl' },
                      ].map(({ key, label, klass }) => (
                        <button
                          key={key}
                          onClick={() => setRadiusSize(key)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            radiusSize === key
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                              : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className={`w-4 h-3 bg-slate-400 ${klass} ${radiusSize === key ? 'bg-white dark:bg-black' : ''}`} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tipografía */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                    TIPOGRAFÍA
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { key: 'inter', label: 'Inter', sample: 'Aa' },
                      { key: 'system', label: 'System', sample: 'Aa' },
                      { key: 'mono', label: 'Mono', sample: 'Aa' },
                      { key: 'sans', label: 'Sans', sample: 'Aa' },
                      { key: 'serif', label: 'Serif', sample: 'Aa' },
                    ].map(({ key, label, sample }) => (
                      <button
                        key={key}
                        onClick={() => setFontFamily(key)}
                        className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                          fontFamily === key
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#242424] ring-slate-900 dark:ring-white bg-slate-50 dark:bg-white/5'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className={`text-lg font-black transition-transform ${fontFamily === key ? 'scale-110' : ''} ${
                          key === 'mono' ? 'font-mono' : key === 'sans' ? 'font-sans' : key === 'serif' ? 'font-serif' : ''
                        } ${fontFamily === key ? 'text-accent-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          {sample}
                        </span>
                        <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Vista Previa */}
            {customizeTab === 'preview' && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200 dark:bg-slate-700" />
                  VISTA PREVIA EN VIVO
                </p>

                {/* Card preview */}
                <div className={`p-4 ${cardStyle === 'bordered' ? 'border border-slate-300 dark:border-slate-600' : cardStyle === 'flat' ? 'shadow-sm' : 'bg-white/50 dark:bg-white/5 backdrop-blur'} rounded-xl`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center text-black font-black text-sm">SP</span>
                    <div className="flex-1 min-w-0">
                      <div className={`h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ${tableDensity === 'compact' ? 'w-1/2' : tableDensity === 'spacious' ? 'w-3/4' : 'w-2/3'}`} />
                      <div className={`h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5 ${tableDensity === 'compact' ? 'w-1/3' : tableDensity === 'spacious' ? 'w-full' : 'w-1/2'}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-500">Preview</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-600 text-[10px] font-bold">Activo</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-[10px] font-bold">Pagado</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-[10px] font-bold">Pendiente</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 text-[10px] font-bold">Error</span>
                  </div>
                </div>

                {/* Table preview */}
                <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50`}>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-3 py-2">Cliente</th>
                        <th className="px-3 py-2">Estado</th>
                        <th className="px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { name: 'Tech Solutions', status: 'paid', total: '$3,025' },
                        { name: 'Digital Agency', status: 'pending', total: '$2,178' },
                        { name: 'Global Trade', status: 'cancelled', total: '$6,292' },
                      ].map((row, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-accent-50/30' : ''} transition-colors`}>
                          <td className={`px-3 py-2 text-slate-700 dark:text-slate-300`}>{row.name}</td>
                          <td className="px-3 py-2"><StatusBadge status={row.status} size="xs" /></td>
                          <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Button preview */}
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl">Botón</button>
                  <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl">Secundario</button>
                  <button className="px-4 py-2 border-2 border-red-500 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl">Peligro</button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700/50 px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              onClick={() => setIsCustomizeOpen(false)}
              className="w-full py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-md"
            >
              Hecho
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: (e: any) => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </button>
  );
}
