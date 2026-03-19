import { Moon, Sun, Menu, LogOut, User, Settings as SettingsIcon, ChevronDown, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const isSidebarCollapsed = false; // Placeholder or use context if needed

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg transition-all duration-300 relative z-[55]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 dark:from-primary-400 dark:via-accent-400 dark:to-secondary-400 group-hover:scale-105 transition-transform duration-300">
                  ¡Hola de nuevo! 👋
                </h2>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Tu chatbot está activo y funcionando
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            <NotificationBell />
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-xl opacity-0 group-hover:opacity-30 transition-all duration-500 blur-sm group-hover:scale-110"></div>
            <button
              onClick={toggleTheme}
              className="relative group p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Cambiar tema"
            >
              <div className="relative">
                {theme === 'light' ? (
                  <div className="relative">
                    <Moon className="w-4.5 h-4.5 text-indigo-600 group-hover:rotate-12 transition-all duration-300 group-hover:text-indigo-700" />
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-50 group-hover:scale-100"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-12 transition-all duration-300 group-hover:text-amber-300" />
                    <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-50 group-hover:scale-100"></div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-accent-500 via-primary-500 to-accent-600 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
            <div 
              onClick={() => {
                console.log('Profile clicked, current state:', isProfileOpen);
                setIsProfileOpen(!isProfileOpen);
              }}
              className="ml-2 flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer group relative z-50"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary-500/20">
                <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=random`} alt="User avatar" className="w-full h-full object-cover"/>
              </div>
              {!isSidebarCollapsed && (
                <div className="hidden lg:block pr-2">
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[100px]">{user?.full_name || 'Inicia Sesión'}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{user?.role || 'Guest'}</p>
                </div>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#11141b] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-6 border-b border-gray-50 dark:border-gray-800/50 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary-500/20 shadow-lg">
                        <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=random`} alt="User avatar" className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user?.full_name || 'Usuario'}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{user?.role || 'Administrator'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-500/10 dark:hover:to-indigo-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <User className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span>Mi Perfil</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-500/10 dark:hover:to-pink-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <SettingsIcon className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span>Ajustes</span>
                    </button>
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
                    <button 
                      onClick={() => {
                        navigate('/security');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-500/10 dark:hover:to-orange-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <Shield className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span>Seguridad</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/help');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-500/10 dark:hover:to-blue-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                      <span>Ayuda y Soporte</span>
                    </button>
                    <div className="h-px bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 my-2 mx-4" />
                    <button 
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                          logout();
                          setIsProfileOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-500/10 dark:hover:to-rose-500/10 rounded-xl transition-all duration-200 group"
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
