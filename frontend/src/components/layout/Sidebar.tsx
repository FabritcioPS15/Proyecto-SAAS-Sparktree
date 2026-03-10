import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, BarChart3, Settings, MessageCircle, CreditCard, Bot, TrendingUp, Cog } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/', color: 'from-gray-600 to-gray-700' },
  { icon: Users, label: 'Usuarios', path: '/users', color: 'from-gray-600 to-gray-700' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations', color: 'from-gray-600 to-gray-700' },
  { icon: TrendingUp, label: 'Clientes Potenciales', path: '/leads', color: 'from-gray-600 to-gray-700' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics', color: 'from-gray-600 to-gray-700' },
  { icon: Bot, label: 'Flujos', path: '/flows', color: 'from-gray-600 to-gray-700' },
  { icon: Cog, label: 'Gestor de Flujos', path: '/flow-manager', color: 'from-gray-600 to-gray-700' },
  { icon: CreditCard, label: 'Facturación', path: '/billing', color: 'from-gray-600 to-gray-700' },
  { icon: Settings, label: 'Configuración', path: '/settings', color: 'from-gray-600 to-gray-700' }
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col w-72 bg-white dark:bg-gray-900 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-2xl">
      <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <div className="p-2 bg-gray-700 rounded-xl shadow-2xl shadow-gray-700/30 hover:shadow-gray-700/40 transition-all duration-300 hover:scale-105">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">ChatBot SaaS</h1>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Panel de Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-lg/25 transform scale-105`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 hover:transform hover:scale-102'
              }`}
            >
              {/* Background decoration */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 shadow-inner' 
                    : 'bg-gray-100/80 dark:bg-gray-800/50 group-hover:bg-gray-200/80 dark:group-hover:bg-gray-700/50'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110 text-white' : 'text-gray-500 dark:text-gray-400 group-hover:scale-110 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }`} />
                </div>
                <span className={`font-semibold text-sm transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {item.label}
                </span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sistema Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
