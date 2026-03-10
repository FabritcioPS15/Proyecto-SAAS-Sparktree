import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
          </button>
          <div className="group">
            <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 group-hover:scale-105 transition-transform duration-300">
              ¡Hola de nuevo! 👋
            </h2>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              Monitorea el rendimiento de tu chatbot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="w-px h-6 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mx-1"></div>

          <button
            onClick={toggleTheme}
            className="group relative p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            aria-label="Cambiar tema"
          >
            <div className="relative">
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </button>
          
          <div className="relative group">
            <div className="ml-2 w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 p-[2px] hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 cursor-pointer">
               <div className="w-full h-full rounded-xl border-2 border-white dark:border-gray-900 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="User avatar" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
               </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
