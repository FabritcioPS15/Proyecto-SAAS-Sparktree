import { TopProgressBar } from './TopProgressBar';

interface PageLoaderProps {
  sectionName?: string;
  isInitial?: boolean; // If it's the first load
}

/**
 * Standard loading screen for pages.
 * Displays a premium loader with the section name.
 */
export const PageLoader = ({ sectionName, isInitial = false }: PageLoaderProps) => {
  return (
    <div className={`flex flex-col flex-1 items-center justify-center relative overflow-hidden animate-in fade-in duration-300 ${isInitial ? 'h-screen w-screen bg-black' : 'h-full min-h-[400px]'}`}>
      <TopProgressBar />
      
      <div className="flex flex-col items-center gap-10 relative z-10">
        {/* NEW CSS LOADER */}
        <div className="loader" />

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-slate-900 dark:text-white font-black text-xl tracking-tighter uppercase">
              {sectionName ? <>Cargando <span className="text-accent-500">{sectionName}</span></> : 'Conectando'}
            </p>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
            Por favor espera <span className="flex gap-1"><span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span><span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span><span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span></span>
          </p>
        </div>
      </div>
    </div>
  );
};

