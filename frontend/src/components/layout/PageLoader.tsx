import { MessageCircle } from 'lucide-react';

interface PageLoaderProps {
  sectionName?: string;
}

/**
 * Standard loading screen for pages.
 * Displays a premium loader with the section name.
 */
export const PageLoader = ({ sectionName }: PageLoaderProps) => {
  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-gray-800/50 shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
      {/* Abstract background elements (shared with Layout/PageBody for consistency) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none" />
      
      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Animated Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800/50 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/25 animate-bounce-slow">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 border-r-primary-500 rounded-[2rem] animate-spin duration-[2000ms]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
            <p className="text-slate-900 dark:text-white font-black text-xl tracking-tight uppercase">
              Cargando <span className="text-primary-600 dark:text-primary-400">{sectionName || 'Apartado'}</span>
            </p>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
            Por favor espera <span className="flex gap-1"><span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span><span className="animate-bounce" style={{ animationDelay: '200ms' }}>.</span><span className="animate-bounce" style={{ animationDelay: '400ms' }}>.</span></span>
          </p>
        </div>
      </div>
    </div>
  );
};
