import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, BarChart3, Settings, MessageCircle, CreditCard, Bot } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/' },
  { icon: Users, label: 'Usuarios', path: '/users' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations' },
  { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
  { icon: Bot, label: 'Flujos', path: '/flows' },
  { icon: CreditCard, label: 'Facturación', path: '/billing' },
  { icon: Settings, label: 'Configuración', path: '/settings' }
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white/70 backdrop-blur-md dark:bg-gray-900/80 border-r border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">ChatBot SaaS</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Panel de Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/30 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
