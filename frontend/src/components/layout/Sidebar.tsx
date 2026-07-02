/* =============================================================================
   SIDEBAR COMPONENT - Premium redesign: Linear/Vercel/GitHub inspired
   ============================================================================= */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, MessageSquare, BarChart3, Settings,
  MessageCircle, CreditCard, TrendingUp, QrCode, Store,
  ChevronLeft, ChevronRight, ShieldAlert, BadgeInfo, ChevronDown
} from 'lucide-react';
import { SiDialogflow } from 'react-icons/si';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger, FaTiktok } from 'react-icons/fa';

// =============================================================================
// MENU CONFIGURATION
// =============================================================================

const empresaMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: TrendingUp, label: 'Potenciales', path: '/leads' },
  { icon: Store, label: 'Catálogos', path: '/catalogs' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: SiDialogflow, label: 'Constructor de Bots', path: '/flow-manager' },
  {
    icon: QrCode,
    label: 'Conexiones',
    path: '/connections',
    subItems: [
      { label: 'WhatsApp', path: '/whatsapp-qr', icon: FaWhatsapp },
      { label: 'Instagram', path: '/instagram-config', icon: FaInstagram },
      { label: 'TikTok', path: '/tiktok-config', icon: FaTiktok },
      { label: 'Telegram', path: '/telegram-config', icon: FaTelegram },
      { label: 'Messenger', path: '/facebook-config', icon: FaFacebookMessenger },
    ],
  },
  { icon: BadgeInfo, label: 'Equipo', path: '/admin/staff' },
];

const adminMenuItems = [
  ...empresaMenuItems.filter(i => i.path !== '/admin/staff'),
  { icon: ShieldAlert, label: 'Empresas', path: '/admin/organizations' },
  { icon: BadgeInfo, label: 'Equipo', path: '/admin/staff' },
];

const empresaCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/clients'] },
  { name: 'Negocio', items: ['/leads', '/analytics', '/catalogs'] },
  { name: 'Automatización', items: ['/flow-manager'] },
  { name: 'Sistema', items: ['/connections', '/admin/staff'] },
];

const adminCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/clients'] },
  { name: 'Negocio', items: ['/leads', '/analytics', '/catalogs'] },
  { name: 'Automatización', items: ['/flow-manager'] },
  { name: 'Sistema', items: ['/connections'] },
  { name: 'Administración', items: ['/admin/organizations', '/admin/staff'] },
];

// =============================================================================
// COMPONENT
// =============================================================================

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = ({ onCollapsedChange }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['/connections']));

  const isEmpresa = user?.role === 'empresa';
  const menuItems = isEmpresa ? empresaMenuItems : adminMenuItems;
  const menuCategories = isEmpresa ? empresaCategories : adminCategories;

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
    onCollapsedChange?.(next);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  return (
    <aside
      className={`hidden md:flex md:flex-col relative transition-all duration-300 ease-in-out
        bg-white dark:bg-[#0F172A]
        border-r border-[#E5E7EB] dark:border-[#1E293B]
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
    >
      {/* Logo / Branding */}
      <div className={`flex items-center gap-3 px-4 h-14 overflow-hidden border-b border-[#E5E7EB] dark:border-[#1E293B] ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shadow-md">
          <MessageCircle className="w-4 h-4 text-white dark:text-black" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none tracking-tight whitespace-nowrap">
              Sparktree
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap mt-0.5">
              Admin Suite
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-6">
        {menuCategories.map((category) => (
          <div key={category.name}>
            {/* Category label */}
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                {category.name}
              </p>
            )}

            <div className="space-y-0.5">
              {menuItems
                .filter(item => category.items.includes(item.path))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const hasSubItems = !!item.subItems?.length;
                  const isExpanded = expandedItems.has(item.path);

                  return (
                    <div key={item.path}>
                      <Link
                        to={item.path}
                        title={collapsed ? item.label : undefined}
                        onClick={e => {
                          if (hasSubItems && !collapsed) {
                            e.preventDefault();
                            toggleExpanded(item.path);
                          }
                        }}
                        className={`
                          group relative flex items-center gap-2.5 rounded-lg transition-all duration-200
                          ${collapsed ? 'justify-center px-0 py-2.5 mx-0' : 'px-3 py-2'}
                          ${isActive
                            ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
                          }
                        `}
                      >
                        {/* Active indicator */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-slate-900 dark:bg-white rounded-r-full" />
                        )}

                        <Icon
                          className={`shrink-0 transition-all duration-200 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />

                        {!collapsed && (
                          <>
                            <span className="text-[13px] truncate flex-1 leading-none">{item.label}</span>
                            {hasSubItems && (
                              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            )}
                          </>
                        )}

                        {/* Tooltip for collapsed mode */}
                        {collapsed && (
                          <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                            {item.label}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white" />
                          </div>
                        )}
                      </Link>

                      {/* Sub-items */}
                      {!collapsed && hasSubItems && isExpanded && (
                        <div className="mt-0.5 ml-3.5 pl-3 border-l border-slate-200 dark:border-white/10 space-y-0.5">
                          {item.subItems?.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                                  isSubActive
                                    ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-white/10'
                                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
                                }`}
                              >
                                {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                                <span>{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#E5E7EB] dark:border-[#1E293B]">
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 ${collapsed ? '' : 'flex-row-reverse'}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-semibold">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

/* =============================================================================
   FIN DEL COMPONENTE SIDEBAR
   ============================================================================= */
