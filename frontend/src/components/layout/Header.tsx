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

import { Moon, Sun, Menu, LogOut, User, Settings as SettingsIcon, ChevronDown, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick?: () => void; // Callback para abrir menú móvil
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  // Hooks y contextos
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  
  // Constantes de configuración
  const isSidebarCollapsed = false; // TODO: Implementar contexto para sidebar state

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 relative z-[55]">
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
              {/* Indicador de estado del sistema */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true" />
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Activo</span>
              </div>
              
              {/* Información principal */}
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  Panel de Control
                </h2>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">
                  Gestiona tu negocio en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección derecha: Notificaciones, tema y perfil */}
        <div className="flex items-center gap-3">
          {/* Sistema de notificaciones */}
          <div className="relative group">
            <NotificationBell />
          </div>

          {/* Control de tema */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className="relative group p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5 text-indigo-600 group-hover:rotate-12 transition-all duration-300 group-hover:text-indigo-700" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-12 transition-all duration-300 group-hover:text-amber-300" />
              )}
            </button>
          </div>
          
          {/* Perfil de usuario y menú desplegable */}
          <div className="relative group">
            <div 
              onClick={() => {
                console.log('Profile clicked, current state:', isProfileOpen);
                setIsProfileOpen(!isProfileOpen);
              }}
              className="ml-2 flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer group relative z-50"
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
                    {user?.full_name || 'Inicia Sesión'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                    {user?.role || 'Guest'}
                  </p>
                </div>
              )}
              
              {/* Indicador de menú desplegable */}
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  isProfileOpen ? 'rotate-180' : ''
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
                          {user?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                          {user?.role || 'Administrator'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Opciones del menú */}
                  <div className="p-2">
                    {/* Opción: Mi Perfil */}
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
                    
                    {/* Opción: Ajustes */}
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
                    
                    {/* Opción: Seguridad */}
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
                    
                    {/* Opción: Ayuda */}
                    <button 
                      onClick={() => {
                        navigate('/help');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 dark:hover:from-cyan-500/10 dark:hover:to-teal-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                      <span>Ayuda</span>
                    </button>
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
