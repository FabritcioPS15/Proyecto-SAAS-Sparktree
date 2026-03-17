import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, MessageSquare, BarChart3, Settings,
  MessageCircle, CreditCard,  TrendingUp, Cog, QrCode,
  ChevronLeft, ChevronRight, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { SiDialogflow } from "react-icons/si";
import { TbReportSearch } from "react-icons/tb";

const menuItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/' },
  { icon: Users, label: 'Usuarios', path: '/users' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: TrendingUp, label: 'Clientes Potenciales', path: '/leads' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: TbReportSearch, label: 'Reportes', path: '/reports' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
  { icon: CreditCard, label: 'Facturación', path: '/billing' },
  { icon: SiDialogflow, label: 'Constructor de Bots', path: '/flows' },
  { icon: Cog, label: 'Gestor de Flujos', path: '/flow-manager' },
  { icon: QrCode, label: 'Conexión WhatsApp', path: '/whatsapp-qr' },
  { icon: ShieldAlert, label: 'Empresas', path: '/admin/organizations' },
  { icon: BadgeInfo, label: 'Personal', path: '/admin/staff' },
];

const menuCategories = [
  { name: 'Principal', items: ['/', '/users', '/conversations'] },
  { name: 'Negocio', items: ['/leads', '/analytics', '/reports'] },
  { name: 'Chatbot', items: ['/flows', '/flow-manager'] },
  { name: 'Sistema', items: ['/settings', '/whatsapp-qr'] },
  { name: 'Administración', items: ['/admin/organizations', '/admin/staff'] },
  { name: 'Facturación', items: ['/billing'] }
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = ({ onCollapsedChange }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', String(newCollapsed));
    onCollapsedChange?.(newCollapsed);
  };

  return (
    <aside
      className={`hidden md:flex md:flex-col relative transition-all duration-300 ease-in-out bg-white dark:bg-[#0f1117] border-r border-gray-100 dark:border-gray-800 shadow-xl ${collapsed ? 'w-[80px]' : 'w-72'
        }`}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 dark:border-gray-800 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 p-2 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl shadow-lg shadow-primary-500/25">
          <MessageCircle className={`${collapsed ? 'w-6 h-6' : 'w-6 h-6'} text-white transition-all duration-300`} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight whitespace-nowrap">Sparktree Chatbot Studio</h1>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Panel de Control</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuCategories.map((category) => (
          <div key={category.name} className="mb-4">
            {/* Category separator and name */}
            <div className={`flex items-center gap-2 mb-2 ${collapsed ? 'px-2 justify-center' : 'px-4'}`}>
              <div className={`${collapsed ? 'w-8 h-px' : 'flex-1 h-px'} bg-gray-200 dark:bg-gray-700`}></div>
              {!collapsed && (
                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {category.name}
                </span>
              )}
              <div className={`${collapsed ? 'w-8 h-px' : 'flex-1 h-px'} bg-gray-200 dark:bg-gray-700`}></div>
            </div>
            
            {/* Menu items in this category */}
            <div className="space-y-1">
              {menuItems
                .filter(item => category.items.includes(item.path))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3.5 rounded-xl transition-all duration-200 overflow-hidden ${
                        collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
                      } ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {/* Active left bar */}
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-r-full" />
                      )}

                      <div className={`flex-shrink-0 transition-transform duration-200 ${
                        isActive ? 'scale-100' : 'group-hover:scale-100'
                      }`}>
                        <Icon className={`${collapsed ? 'w-[24px] h-[24px]' : 'w-[22px] h-[22px]'} transition-all duration-300`} />
                      </div>

                      {!collapsed && (
                        <span className="text-[14px] font-semibold truncate">{item.label}</span>
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
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Status */}
      <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" title="Sistema Online" />
            <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">Sistema Online</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
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
