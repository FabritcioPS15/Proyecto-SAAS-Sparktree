import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, MessageSquare, BarChart3, Settings,
  MessageCircle, CreditCard, TrendingUp, QrCode, Store,
  ChevronLeft, ChevronRight, ShieldAlert, BadgeInfo, ChevronDown,
  ShoppingBag, Tag, MessageSquareText, UserCheck, Clock,
  Bot, Bell, Webhook, CreditCard as PaymentIcon,
  Activity, Lock, History, Globe, DollarSign, User, Database,
  LogOut, Brain, Mail, Calendar as CalendarIcon, Smartphone,
  FileText
} from 'lucide-react';
import { SiDialogflow } from 'react-icons/si';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger, FaTiktok } from 'react-icons/fa';

interface SubMenuItem {
  label: string;
  path: string;
  icon?: any;
  subItems?: SubMenuItem[];
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  subItems?: SubMenuItem[];
}

const empresaMenuItemsExpanded: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Mail, label: 'Correo', path: '/email' },
  { icon: CalendarIcon, label: 'Calendario', path: '/calendar' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: TrendingUp, label: 'Potenciales', path: '/leads' },
  { icon: Store, label: 'Catálogos', path: '/catalogs' },
  { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
  { icon: FileText, label: 'Cotizaciones', path: '/cotizaciones' },
  { icon: Tag, label: 'Promociones', path: '/promotions' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: SiDialogflow, label: 'Constructor de Bots', path: '/flow-manager' },
  { icon: MessageSquareText, label: 'Plantillas', path: '/message-templates' },
  { icon: UserCheck, label: 'Reglas Asignación', path: '/assignment-rules' },
  { icon: Clock, label: 'Horarios Atención', path: '/business-hours' },
  {
    icon: User,
    label: 'Atención',
    path: '/support',
    subItems: [
      { label: 'Agentes', path: '/agents', icon: UserCheck },
      { label: 'Base Conocimiento', path: '/knowledge-base', icon: Bot },
    ],
  },
  { icon: Bell, label: 'Notificaciones', path: '/notifications' },
  { icon: Webhook, label: 'Webhooks / API', path: '/webhooks' },
  {
    icon: PaymentIcon,
    label: 'Facturación',
    path: '/billing',
    subItems: [
      { label: 'Planes y Suscripciones', path: '/billing/plans', icon: CreditCard },
      { label: 'Pagos', path: '/billing/payments', icon: DollarSign },
      { label: 'Uso/Consumo', path: '/billing/usage', icon: Database },
    ],
  },
  {
    icon: QrCode,
    label: 'Conexiones',
    path: '/connections',
    subItems: [
      {
        label: 'WhatsApp',
        path: '/whatsapp-qr',
        icon: FaWhatsapp,
        subItems: [
          { label: 'QR', path: '/whatsapp-qr' },
          { label: 'Multi', path: '/multi-whatsapp' },
        ],
      },
      { label: 'Instagram', path: '/instagram-config', icon: FaInstagram },
      { label: 'TikTok', path: '/tiktok-config', icon: FaTiktok },
      { label: 'Telegram', path: '/telegram-config', icon: FaTelegram },
      { label: 'Messenger', path: '/facebook-config', icon: FaFacebookMessenger },
    ],
  },
  { icon: BadgeInfo, label: 'Equipo', path: '/admin/staff' },
  { icon: Lock, label: 'Roles y Permisos', path: '/roles-permissions' },
  { icon: History, label: 'Auditoría', path: '/audit-logs' },
  { icon: Brain, label: 'Proveedores LLM', path: '/ai/providers' },
];

const adminMenuItems = [
  ...empresaMenuItemsExpanded.filter(i => i.path !== '/admin/staff' && i.path !== '/roles-permissions' && i.path !== '/audit-logs'),
  { icon: ShieldAlert, label: 'Organizaciones', path: '/admin/organizations' },
  { icon: BadgeInfo, label: 'Equipo', path: '/admin/staff' },
  { icon: Lock, label: 'Roles y Permisos', path: '/roles-permissions' },
  { icon: History, label: 'Auditoría', path: '/audit-logs' },
];

const superAdminMenuItems: MenuItem[] = [
  { icon: Globe, label: 'Todas las Empresas', path: '/superadmin/companies' },
  { icon: DollarSign, label: 'Métricas del Negocio', path: '/superadmin/business-metrics' },
  { icon: Activity, label: 'Logs del Sistema', path: '/superadmin/system-logs' },
  { icon: ShieldAlert, label: 'Organizaciones', path: '/admin/organizations' },
  ...empresaMenuItemsExpanded,
];

const staffMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Mail, label: 'Correo', path: '/email' },
  { icon: CalendarIcon, label: 'Calendario', path: '/calendar' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: UserCheck, label: 'Atención', path: '/support' },
  { icon: Bot, label: 'Base Conocimiento', path: '/knowledge-base' },
  { icon: Bell, label: 'Notificaciones', path: '/notifications' },
];

const agentMenuItems: MenuItem[] = [
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: Bot, label: 'Base Conocimiento', path: '/knowledge-base' },
];

const empresaCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/email', '/calendar', '/clients'] },
  { name: 'Negocio', items: ['/leads', '/analytics', '/catalogs', '/orders', '/cotizaciones', '/promotions'] },
  { name: 'Automatización', items: ['/flow-manager', '/message-templates', '/assignment-rules', '/business-hours'] },
  { name: 'Atención', items: ['/support', '/agents', '/knowledge-base'] },
  { name: 'Sistema', items: ['/connections', '/notifications', '/webhooks', '/admin/staff', '/roles-permissions', '/audit-logs', '/ai/providers'] },
  { name: 'Facturación', items: ['/billing', '/billing/plans', '/billing/payments', '/billing/usage'] },
];

const adminCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/email', '/calendar', '/clients'] },
  { name: 'Negocio', items: ['/leads', '/analytics', '/catalogs', '/orders', '/cotizaciones', '/promotions'] },
  { name: 'Automatización', items: ['/flow-manager', '/message-templates', '/assignment-rules', '/business-hours'] },
  { name: 'Atención', items: ['/support', '/agents', '/knowledge-base'] },
  { name: 'Sistema', items: ['/connections', '/notifications', '/webhooks', '/ai/providers'] },
  { name: 'Administración', items: ['/admin/organizations', '/admin/staff', '/roles-permissions', '/audit-logs'] },
  { name: 'Facturación', items: ['/billing', '/billing/plans', '/billing/payments', '/billing/usage'] },
];

const superAdminCategories: Array<{ name: string; items: string[] }> = [
  { name: 'Super Admin', items: ['/superadmin/companies', '/superadmin/business-metrics', '/superadmin/system-logs'] },
  { name: 'Administración', items: ['/admin/organizations'] },
  ...empresaCategories,
];

const staffCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/email', '/calendar', '/clients'] },
  { name: 'Atención', items: ['/support', '/agents', '/knowledge-base'] },
  { name: 'Sistema', items: ['/notifications'] },
];

const agentCategories = [
  { name: 'Principal', items: ['/conversations', '/clients'] },
  { name: 'Atención', items: ['/knowledge-base'] },
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ onCollapsedChange, isMobileOpen, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['/connections', '/whatsapp-qr']));

  const isEmpresa = user?.role === 'empresa';
  const isSuperAdmin = user?.role === 'super_admin';
  const isStaff = user?.role === 'staff';
  const isAgent = user?.role === 'agent';
  const menuItems = isSuperAdmin ? superAdminMenuItems : (isEmpresa ? empresaMenuItemsExpanded : (isStaff ? staffMenuItems : (isAgent ? agentMenuItems : adminMenuItems)));
  const menuCategories = isSuperAdmin ? superAdminCategories : (isEmpresa ? empresaCategories : (isStaff ? staffCategories : (isAgent ? agentCategories : adminCategories)));

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
    onCollapsedChange?.(next);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => {
      if (prev.has(path)) {
        const next = new Set(prev);
        next.delete(path);
        return next;
      }
      return new Set([...prev, path]);
    });
  };

  const sidebarContent = (mobile: boolean) => (
    <>
      {/* ===== BRANDING / TITLE ===== */}
      <div
        className={`
          flex items-center gap-3 px-4
          bg-gradient-to-b from-slate-50/80 to-transparent dark:from-white/[0.02] to-transparent
          ${collapsed && !mobile ? 'justify-center h-16' : 'h-[72px]'}
        `}
      >
        <div className="flex-shrink-0 w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-md shadow-slate-900/10 dark:shadow-white/5">
          <MessageCircle className="w-4 h-4 text-white dark:text-black" strokeWidth={2.5} />
        </div>
        {(!collapsed || mobile) && (
          <div className="overflow-hidden flex-1 min-w-0">
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight whitespace-nowrap">
              Grupos SC
            </h1>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap mt-1">
              Admin Suite
            </p>
          </div>
        )}
        {mobile && onMobileClose && (
          <button onClick={onMobileClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Separate divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-slate-200/0 via-slate-200 dark:via-slate-700/50 to-slate-200/0" />

      {/* ===== NAVIGATION ===== */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-4">
        {menuCategories.map((category) => (
          <div key={category.name}>
            {(!collapsed || mobile) && (
              <p className="px-3 mb-1 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">
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
                  const sideCollapsed = collapsed && !mobile;

                  return (
                    <div key={item.path}>
                      <Link
                        to={item.path}
                        title={sideCollapsed ? item.label : undefined}
                        onClick={e => {
                          if (hasSubItems && !sideCollapsed) {
                            e.preventDefault();
                            toggleExpanded(item.path);
                          }
                          if (mobile && onMobileClose && !hasSubItems) onMobileClose();
                        }}
                        className={`
                          group relative flex items-center gap-2.5 rounded-lg transition-all duration-200
                          ${sideCollapsed ? 'justify-center py-2.5' : 'px-2.5 py-2'}
                          ${isActive
                            ? 'bg-slate-100 dark:bg-accent-500/10 text-slate-900 dark:text-accent-300 font-semibold shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-accent-300 font-medium'
                          }
                        `}
                      >
                        {isActive && !sideCollapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-900 dark:bg-accent-400 rounded-r-full" />
                        )}

                        <Icon
                          className={`shrink-0 transition-all duration-200 ${sideCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'opacity-100 dark:text-accent-300' : 'opacity-60 group-hover:opacity-100'}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />

                        {!sideCollapsed && (
                          <>
                            <span className="text-[13px] truncate flex-1 leading-none">{item.label}</span>
                            {hasSubItems && (
                              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            )}
                          </>
                        )}

                        {sideCollapsed && (
                          <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                            {item.label}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white" />
                          </div>
                        )}
                      </Link>

                      {!sideCollapsed && hasSubItems && isExpanded && (
                        <div className="mt-0.5 ml-4 pl-2.5 border-l border-slate-200 dark:border-white/10 space-y-0.5">
                          {item.subItems?.map((sub) => {
                            const SubIcon = sub.icon;
                            const subHasItems = !!sub.subItems?.length;
                            const isSubExpanded = expandedItems.has(sub.path);
                            const isSubActive = location.pathname === sub.path;

                            if (subHasItems) {
                              return (
                                <div key={sub.path}>
                                  <button
                                    onClick={() => toggleExpanded(sub.path)}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                                      isSubActive
                                        ? 'text-slate-900 dark:text-accent-300 font-semibold bg-slate-100 dark:bg-accent-500/10'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-accent-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
                                      }`}
                                  >
                                    {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                                    <span className="flex-1 text-left">{sub.label}</span>
                                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isSubExpanded && (
                                    <div className="ml-4 pl-2.5 border-l border-slate-200 dark:border-white/10 space-y-0.5 mt-0.5">
                                      {sub.subItems?.map((nested) => {
                                        const isNestedActive = location.pathname === nested.path;
                                        return (
                                          <Link
                                            key={nested.path}
                                            to={nested.path}
                                            onClick={() => { if (mobile && onMobileClose) onMobileClose(); }}
                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                                              isNestedActive
                                                  ? 'text-slate-900 dark:text-accent-300 font-semibold bg-slate-100 dark:bg-accent-500/10'
                                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-accent-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
                                            }`}
                                          >
                                            <span>{nested.label}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => { if (mobile && onMobileClose) onMobileClose(); }}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                                  isSubActive
                                      ? 'text-slate-900 dark:text-accent-300 font-semibold bg-slate-100 dark:bg-accent-500/10'
                                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-accent-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
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

      {/* ===== FOOTER / COLLAPSE ===== */}
      <div className="border-t border-[#E5E7EB] dark:border-[#333333] px-2 py-2.5 space-y-1">
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-1">
            <div className="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-500 text-[10px] font-black shrink-0">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate leading-tight">
                {user.email || 'Usuario'}
              </p>
              <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate leading-tight mt-0.5">
                {user.role || 'user'}
              </p>
            </div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-accent-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 ${collapsed ? '' : 'flex-row-reverse'}`}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Colapsar</span>
              </>
            )}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:flex-col relative transition-all duration-300 ease-in-out
          bg-white dark:bg-[#1a1a1a]
          border-r border-[#E5E7EB] dark:border-[#333333]
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        `}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            onClick={onMobileClose}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 md:hidden flex flex-col
              w-[280px] bg-white dark:bg-[#1a1a1a]
              border-r border-[#E5E7EB] dark:border-[#333333]
              animate-in slide-in-from-left duration-300"
          >
            {sidebarContent(true)}
          </aside>
        </>
      )}
    </>
  );
};
