/* =============================================================================
   SIDEBAR COMPONENT - Navegación lateral principal
   =============================================================================
   
   Propósito:
   - Proporcionar navegación estructurada por roles
   - Facilitar acceso rápido a todas las secciones del sistema
   - Mostrar organización jerárquica del menú
   - Adaptarse dinámicamente al rol del usuario
   
   Características:
   - Diseño responsive con colapsado
   - Menús diferenciados por rol (Empresa vs Admin/Staff)
   - Indicadores visuales de sección activa
   - Categorización lógica de opciones
   - Estados hover y transiciones suaves
   
   Dependencies:
   - AuthContext: Para determinar rol y permisos
   - React Router: Para navegación y estado actual
   - Lucide Icons: Para iconografía consistente
   ============================================================================= */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, MessageSquare, BarChart3, Settings,
  MessageCircle, CreditCard, TrendingUp, QrCode,
  ChevronLeft, ChevronRight, ShieldAlert, BadgeInfo, ChevronDown
} from 'lucide-react';
import { SiDialogflow } from "react-icons/si";
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger, FaTiktok } from 'react-icons/fa';

// =============================================================================
// CONFIGURACIÓN DE MENÚS POR ROL
// =============================================================================

/**
 * Menú para rol EMPRESA (acceso limitado a funciones de negocio)
 * - Enfocado en operaciones del día a día
 * - Sin acceso a administración del sistema
 * - Prioriza herramientas de cliente y chatbot
 */
const empresaMenuItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: TrendingUp, label: 'Clientes Potenciales', path: '/leads' },
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
      { label: 'Messenger', path: '/facebook-config', icon: FaFacebookMessenger }
    ]
  },
  { icon: Settings, label: 'Configuración', path: '/settings' },
  { icon: CreditCard, label: 'Facturación', path: '/billing' },
  { icon: BadgeInfo, label: 'Equipo', path: '/admin/staff' },
];

/**
 * Menú completo para roles ADMIN y STAFF
 * - Acceso completo a todas las funciones
 * - Incluye herramientas administrativas
 * - Gestión de usuarios y organizaciones
 */
const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: TrendingUp, label: 'Clientes Potenciales', path: '/leads' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
  { icon: CreditCard, label: 'Facturación', path: '/billing' },
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
      { label: 'Messenger', path: '/facebook-config', icon: FaFacebookMessenger }
    ]
  },
  { icon: ShieldAlert, label: 'Empresas', path: '/admin/organizations' },
  { icon: BadgeInfo, label: 'Equipo', path: '/admin/staff' },
];

// =============================================================================
// CATEGORIZACIÓN DE MENÚS
// =============================================================================

/**
 * Categorías para rol EMPRESA
 * Organización lógica de funciones por área de negocio
 */
const empresaCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/clients'] },
  { name: 'Negocio', items: ['/leads', '/analytics'] },
  { name: 'Chatbot', items: ['/flow-manager'] },
  { name: 'Sistema', items: ['/settings', '/connections', '/admin/staff'] },
  { name: 'Facturación', items: ['/billing'] }
];

/**
 * Categorías para roles ADMIN y STAFF
 * Incluyen sección adicional de administración
 */
const adminCategories = [
  { name: 'Principal', items: ['/', '/conversations', '/clients'] },
  { name: 'Negocio', items: ['/leads', '/analytics'] },
  { name: 'Chatbot', items: ['/flow-manager'] },
  { name: 'Sistema', items: ['/settings', '/connections'] },
  { name: 'Administración', items: ['/admin/organizations', '/admin/staff'] },
  { name: 'Facturación', items: ['/billing'] }
];

// =============================================================================
// TIPOS E INTERFACES
// =============================================================================

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void; // Callback para notificar cambios de estado
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export const Sidebar = ({ onCollapsedChange }: SidebarProps) => {
  // Hooks y estado
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    // Recuperar estado del sidebar desde localStorage
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['/connections']));

  // Determinar configuración según rol del usuario
  const isEmpresa = user?.role === 'empresa';
  const menuItems = isEmpresa ? empresaMenuItems : adminMenuItems;
  const menuCategories = isEmpresa ? empresaCategories : adminCategories;

  /**
   * Alterna el estado de colapsado del sidebar
   * - Actualiza estado local
   * - Persiste en localStorage
   * - Notifica al componente padre
   */
  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', String(newCollapsed));
    onCollapsedChange?.(newCollapsed);
  };

  /**
   * Alterna el estado expandido de un item con sub-items
   */
  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  return (
    <aside
      className={`hidden md:flex md:flex-col relative transition-all duration-300 ease-in-out bg-[#0a0c10] border-r border-white/5 shadow-2xl ${
        collapsed ? 'w-[75px]' : 'w-[270px]'
      }`}
    >
      {/* Sección de branding/logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/5 overflow-hidden ${
        collapsed ? 'justify-center' : ''
      }`}>
        {/* Icono del logo */}
        <div className="flex-shrink-0 p-2 bg-accent-500 rounded-xl shadow-lg shadow-accent-500/20">
          <MessageCircle 
            className={`${collapsed ? 'w-5 h-5' : 'w-6 h-6'} text-black transition-all duration-300`} 
            strokeWidth={2.5} 
          />
        </div>
        
        {/* Texto del branding (solo cuando no está colapsado) */}
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-black text-white leading-tight tracking-tighter whitespace-nowrap">
              grupo sc
            </h1>
            <p className="text-[10px] font-bold text-accent-500/80 uppercase tracking-[0.2em] whitespace-nowrap">
              Admin Suite
            </p>
          </div>
        )}
      </div>

      {/* Sección de navegación principal */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Renderizar categorías de menú */}
        {menuCategories.map((category) => (
          <div key={category.name} className="mb-6">
            {/* Título de categoría (solo cuando no está colapsado) */}
            {!collapsed && (
              <div className="flex items-center gap-3 mb-3 px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap">
                  {category.name}
                </span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
            )}

            {/* Items de la categoría */}
            <div className="space-y-1.5">
              {menuItems
                .filter(item => category.items.includes(item.path))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedItems.has(item.path);

                  return (
                    <div key={item.path}>
                      {/* Item principal */}
                      <Link
                        to={item.path}
                        title={collapsed ? item.label : undefined}
                        onClick={() => hasSubItems && !collapsed && toggleExpanded(item.path)}
                        className={`group relative flex items-center gap-3 rounded-xl transition-all duration-300 overflow-hidden ${
                          collapsed ? 'justify-center px-0 py-3.5' : 'px-4 py-2.5'
                        } ${
                          isActive
                            ? 'bg-accent-500 text-black shadow-lg shadow-accent-500/30 font-black'
                            : 'text-slate-400 hover:bg-accent-500/10 hover:text-white border border-transparent'
                        }`}
                      >
                        {/* Icono del item */}
                        <div className={`transition-transform duration-300 ${
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}>
                          <Icon 
                            className={`${collapsed ? 'w-5 h-5' : 'w-[20px] h-[20px]'}`} 
                            strokeWidth={isActive ? 2.5 : 2} 
                          />
                        </div>

                        {/* Etiqueta del item (solo cuando no está colapsado) */}
                        {!collapsed && (
                          <span className="text-[13.5px] truncate tracking-tight flex-1">
                            {item.label}
                          </span>
                        )}

                        {/* Chevron para sub-items (solo cuando no está colapsado) */}
                        {!collapsed && hasSubItems && (
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        )}

                        {/* Indicador de estado activo (solo cuando no está colapsado) */}
                        {isActive && !collapsed && (
                          <div className="absolute right-4 w-1.5 h-1.5 bg-black/40 rounded-full" />
                        )}

                        {/* Tooltip para modo colapsado */}
                        {collapsed && (
                          <div className="pointer-events-none absolute left-full ml-4 px-3 py-2 bg-white text-black text-[11px] font-black rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                            {item.label}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
                          </div>
                        )}
                      </Link>

                      {/* Sub-items (solo cuando no está colapsado y está expandido) */}
                      {!collapsed && hasSubItems && isExpanded && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname === subItem.path;
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                                  isSubActive
                                    ? 'bg-accent-500/20 text-accent-400 font-semibold'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                }`}
                              >
                                {SubIcon && <SubIcon className="w-4 h-4" />}
                                <span className="text-xs">{subItem.label}</span>
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

      {/* Botón de colapsado */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={toggleCollapsed}
          className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group ${
            collapsed ? '' : 'flex-row-reverse'
          }`}
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          )}
          {!collapsed && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
              Colapsar
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
/* =============================================================================
   FIN DEL COMPONENTE SIDEBAR
   ============================================================================= */

