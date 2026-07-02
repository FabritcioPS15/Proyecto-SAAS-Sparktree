/* =============================================================================
   HEADER COMPONENT - Premium redesign: Linear/Vercel/Stripe inspired
   ============================================================================= */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Menu, LogOut, User, Settings as SettingsIcon,
  ChevronDown, Building2, Users, Bell, Search, Plus, HelpCircle, CreditCard
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, activeProfile, clearProfile } = useAuth();
  const { connections } = useConnections();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-[55] bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
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

          {/* Search bar */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1E293B] rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-all w-56"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">Buscar...</span>
            <span className="ml-auto text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md">⌘K</span>
          </button>
        </div>

        {/* Right: channels status + actions + profile */}
        <div className="flex items-center gap-2">

          {/* Channel connection pills */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1E293B] rounded-xl">
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
                  <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-[#111827] ${isConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </button>
              );
            })}
          </div>

          {/* Create Flow button */}
          <button
            onClick={() => navigate('/flow-manager')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear Flujo
          </button>

          {/* Help */}
          <button className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-[#111827] hover:text-slate-700 dark:hover:text-slate-300 transition-all">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-[#111827] hover:text-slate-700 dark:hover:text-slate-300 transition-all"
            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="p-1">
            <NotificationBell />
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white dark:hover:bg-[#111827] border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#1E293B] transition-all"
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
                  {activeProfile ? 'Equipo' : (user?.role || 'Guest')}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info header */}
                  <div className="px-4 py-4 border-b border-[#E5E7EB] dark:border-[#1E293B]">
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

                  {/* Menu items */}
                  <div className="p-2 space-y-0.5">
                    {user?.role === 'empresa' && activeProfile && (
                      <MenuItem icon={<Users className="w-4 h-4" />} label="Cambiar Perfil" onClick={() => { clearProfile(); setIsProfileOpen(false); }} />
                    )}
                    <MenuItem icon={<User className="w-4 h-4" />} label="Mi Perfil y Ajustes" onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} />
                    <MenuItem icon={theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} label={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'} onClick={(e) => { e.stopPropagation(); toggleTheme(); }} />
                    <MenuItem icon={<CreditCard className="w-4 h-4" />} label="Facturación" onClick={() => { navigate('/billing'); setIsProfileOpen(false); }} />

                    {user?.role === 'admin' && (
                      <>
                        <div className="my-1 border-t border-[#E5E7EB] dark:border-[#1E293B]" />
                        <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Administración</p>
                        <MenuItem icon={<Building2 className="w-4 h-4" />} label="Organizaciones" onClick={() => { navigate('/admin/organizations'); setIsProfileOpen(false); }} />
                        <MenuItem icon={<Users className="w-4 h-4" />} label="Personal (Staff)" onClick={() => { navigate('/admin/staff'); setIsProfileOpen(false); }} />
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#E5E7EB] dark:border-[#1E293B] p-2">
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

      {/* Subtle bottom separator */}
      <div className="border-b border-slate-200/60 dark:border-white/5" />
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

/* =============================================================================
   FIN DEL COMPONENTE HEADER
   ============================================================================= */
