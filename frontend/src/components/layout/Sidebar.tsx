import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, MessageSquare, BarChart3, Settings,
  MessageCircle, CreditCard, Bot, TrendingUp, Cog, QrCode,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/' },
  { icon: Users, label: 'Usuarios', path: '/users' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: TrendingUp, label: 'Clientes Potenciales', path: '/leads' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: Bot, label: 'Flujos', path: '/flows' },
  { icon: Cog, label: 'Gestor de Flujos', path: '/flow-manager' },
  { icon: CreditCard, label: 'Facturación', path: '/billing' },
  { icon: QrCode, label: 'Conexión WhatsApp', path: '/whatsapp-qr' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  return (
    <aside
      className={`hidden md:flex md:flex-col relative transition-all duration-300 ease-in-out bg-white dark:bg-[#0f1117] border-r border-gray-100 dark:border-gray-800 shadow-xl ${collapsed ? 'w-[72px]' : 'w-64'
        }`}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-black text-gray-900 dark:text-white leading-tight whitespace-nowrap">ChatBot ST</h1>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Panel de Control</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3.5 rounded-xl transition-all duration-200 overflow-hidden ${collapsed ? 'justify-center px-0 py-4' : 'px-4 py-3.5'
                } ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {/* Active left bar */}
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-r-full" />
              )}

              <div className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon className="w-[22px] h-[22px]" />
              </div>

              {!collapsed && (
                <span className="text-[13.5px] font-semibold truncate">{item.label}</span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-white" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <div className={`p-3 border-t border-gray-100 dark:border-gray-800 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Sistema Online" />
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Sistema Online</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3.5 top-[72px] z-20 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
        title={collapsed ? 'Expandir' : 'Colapsar'}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          : <ChevronLeft className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        }
      </button>
    </aside>
  );
};
