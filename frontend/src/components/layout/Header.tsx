/* =============================================================================
   HEADER COMPONENT - Componente principal de navegación superior
   =============================================================================
   
   Propósito:
   - Proporcionar navegación y control del sistema
   - Mostrar estado del sistema y notificaciones
   - Facilitar acceso rápido a funciones principales
   
   Características:
   - Responsive design con menú móvil
   - Sistema de notificaciones en tiempo real
   - Control de tema (light/dark)
   - Gestión de perfil de usuario
   - Indicadores de estado del sistema
   
   Dependencies:
   - ThemeContext: Para control de tema
   - AuthContext: Para datos de usuario
   - NotificationContext: Para sistema de notificaciones
   ============================================================================= */

import { Moon, Sun, Menu, LogOut, User, Settings as SettingsIcon, ChevronDown, Shield, CreditCard, HelpCircle, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick?: () => void; // Callback para abrir menú móvil
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  // Hooks y contextos
  const { theme, toggleTheme } = useTheme();
  const { user, logout, activeProfile, clearProfile } = useAuth();
  const { connections } = useConnections();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Constantes de configuración
  const isSidebarCollapsed = false; // TODO: Implementar contexto para sidebar state

  // Platform icon mapping
  const platformIcons: Record<string, any> = {
    whatsapp: FaWhatsapp,
    telegram: FaTelegram,
    instagram: FaInstagram,
    facebook_messenger: FaFacebookMessenger,
    tiktok: SiTiktok
  };

  // Platform routes
  const platformRoutes: Record<string, string> = {
    whatsapp: '/whatsapp-qr',
    telegram: '/telegram-config',
    instagram: '/instagram-config',
    facebook_messenger: '/facebook-config',
    tiktok: '/tiktok-config'
  };

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-[#0a0c10]/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 relative z-[55]">
      {/* Contenedor principal del header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Sección izquierda: Menú móvil y título */}
        <div className="flex items-center gap-4">
          {/* Botón de menú para móvil */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
          </button>

          {/* Título y estado del sistema */}
          <div className="group">
            <div className="flex items-center gap-3">
              {/* Información principal */}
              <div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                  Sparktree OS
                </h2>
                <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-0.5">
                  Gestiona tu negocio en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección derecha: Conexiones, notificaciones, tema y perfil */}
        <div className="flex items-center gap-3">
          {/* Indicadores de conexión de redes sociales */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-sm">
            {Object.keys(platformIcons).map((platform) => {
              const Icon = platformIcons[platform];
              const conn = connections.find(c => c.platform_type === platform);
              const isConnected = conn?.status === 'connected';
              const route = platformRoutes[platform];

              // Dynamic brand colors for active states
              const brandColors: Record<string, string> = {
                whatsapp: 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 drop-shadow-[0_0_4px_rgba(16,185,129,0.2)]',
                telegram: 'text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 drop-shadow-[0_0_4px_rgba(14,165,233,0.2)]',
                instagram: 'text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 drop-shadow-[0_0_4px_rgba(236,72,153,0.2)]',
                facebook_messenger: 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 drop-shadow-[0_0_4px_rgba(59,130,246,0.2)]',
                tiktok: 'text-[#010101] hover:text-[#fe2c55] dark:text-[#fe2c55] dark:hover:text-[#010101] drop-shadow-[0_0_4px_rgba(254,44,85,0.2)]'
              };

              const activeClass = brandColors[platform];
              const inactiveClass = 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500';

              const platformNames: Record<string, string> = {
                whatsapp: 'WhatsApp',
                telegram: 'Telegram',
                instagram: 'Instagram',
                facebook_messenger: 'Messenger',
                tiktok: 'TikTok'
              };

              return (
                <button
                  key={platform}
                  onClick={() => navigate(route)}
                  className="relative p-2 rounded-xl transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:scale-110 active:scale-95 group"
                  title={`${platformNames[platform]} - ${isConnected ? 'Conectado' : 'Desconectado (Configurar)'}`}
                >
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${isConnected ? activeClass : inactiveClass}`} />

                  {/* Active/Inactive status dot badge */}
                  <span className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 transition-all duration-300 ${isConnected
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }`} />

                  {/* Tooltip detail */}
                  <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-gray-900/95 dark:bg-gray-800/95 border border-gray-800 dark:border-gray-700/50 text-[10px] font-bold text-white uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-[60]">
                    {platformNames[platform]}: {isConnected ? 'Activo' : 'Inactivo'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sistema de notificaciones */}
          <div className="relative group">
            <NotificationBell />
          </div>



          {/* Perfil de usuario y menú desplegable */}
          <div className="relative group">
            <div
              onClick={() => {
                console.log('Profile clicked, current state:', isProfileOpen);
                setIsProfileOpen(!isProfileOpen);
              }}
              className="ml-2 flex items-center gap-3 bg-white/80 dark:bg-black/40 p-1.5 pr-4 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-black transition-all duration-300 cursor-pointer group relative z-50"
              role="button"
              tabIndex={0}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              {/* Avatar del usuario */}
              <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=random`}
                  alt={`Avatar de ${user?.full_name || 'Usuario'}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Información del usuario (solo en desktop) */}
              {!isSidebarCollapsed && (
                <div className="hidden lg:block pr-2">
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[100px]">
                    {activeProfile?.name || user?.full_name || 'Inicia Sesión'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                    {activeProfile ? 'Equipo' : (user?.role || 'Guest')}
                  </p>
                </div>
              )}

              {/* Indicador de menú desplegable */}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''
                  }`}
              />
            </div>

            {/* Menú desplegable de perfil */}
            {isProfileOpen && (
              <>
                {/* Backdrop para cerrar menú al hacer click fuera */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                  aria-hidden="true"
                />

                {/* Contenedor del menú */}
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#11141b] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {/* Cabecera del menú con información del usuario */}
                  <div className="p-6 border-b border-gray-50 dark:border-gray-800/50 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
                    <div className="flex items-center gap-4">
                      {/* Avatar grande */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary-500/20 shadow-lg">
                        <img
                          src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=random`}
                          alt={`Avatar de ${user?.full_name || 'Usuario'}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Información detallada del usuario */}
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                          {activeProfile?.name || user?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                          {activeProfile ? 'Miembro de Equipo' : (user?.role || 'Administrator')}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opciones del menú */}
                  <div className="p-2">
                    {user?.role === 'empresa' && activeProfile && (
                      <button 
                        onClick={() => {
                          clearProfile();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-500/10 dark:hover:to-teal-500/10 rounded-xl transition-all duration-200 group"
                      >
                        <Users className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span>Cambiar Perfil</span>
                      </button>
                    )}
                    {/* Opción: Ajustes / Mi Perfil */}
                    <button 
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-500/10 dark:hover:to-indigo-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <User className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span>Mi Perfil y Ajustes</span>
                    </button>
                    
                    {/* Opción: Cambiar Tema */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-500/10 dark:hover:to-purple-500/10 rounded-xl transition-all duration-200 group"
                    >
                      {theme === 'light' ? (
                        <Moon className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
                    </button>
                    
                    {/* Opción: Facturación */}
                    <button 
                      onClick={() => {
                        navigate('/billing');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-500/10 dark:hover:to-emerald-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <CreditCard className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                      <span>Facturación</span>
                    </button>

                    {/* Opciones de Administrador */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="my-2 border-t border-gray-100 dark:border-gray-800/50" />
                        <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Administración
                        </div>
                        
                        <button 
                          onClick={() => {
                            navigate('/admin/organizations');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-500/10 dark:hover:to-red-500/10 rounded-xl transition-all duration-200 group"
                        >
                          <Building2 className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                          <span>Organizaciones</span>
                        </button>

                        <button 
                          onClick={() => {
                            navigate('/admin/staff');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-500/10 dark:hover:to-cyan-500/10 rounded-xl transition-all duration-200 group"
                        >
                          <Users className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                          <span>Personal (Staff)</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Separador */}
                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  {/* Opción: Cerrar Sesión */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
/* =============================================================================
   FIN DEL COMPONENTE HEADER
   ============================================================================= */

