import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../../contexts/NotificationContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 dark:from-primary-400 dark:via-accent-400 dark:to-secondary-400 group-hover:scale-105 transition-transform duration-300">
                  ¡Hola de nuevo! 👋
                </h2>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Tu chatbot está activo y funcionando
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            <NotificationBell />
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            <button
              onClick={toggleTheme}
              className="relative group p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Cambiar tema"
            >
              <div className="relative">
                {theme === 'light' ? (
                  <Moon className="w-4.5 h-4.5 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
                ) : (
                  <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blueaccent-500 via-primary-500 to-accent-600 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
            <div className="ml-2 w-11 h-11 rounded-xl bg-gradient-to-tr from-blueaccent-500 via-primary-500 to-accent-600 p-[2px] hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/25 cursor-pointer">
               <div className="w-full h-full rounded-xl border-2 border-white dark:border-gray-900 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="User avatar" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
               </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
