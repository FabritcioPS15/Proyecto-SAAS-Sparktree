import { Moon, Sun, Menu, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">¡Hola de nuevo! 👋</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monitorea el rendimiento de tu chatbot</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 relative"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900 animate-pulse"></span>
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200/50 dark:border-gray-700/50"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-indigo-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>
          
          <div className="ml-2 w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px]">
             <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-900 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="User avatar" className="w-full h-full object-cover"/>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};
