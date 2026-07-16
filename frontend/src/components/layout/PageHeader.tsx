import React from 'react';

interface PageHeaderProps {
  title: string;
  highlight?: React.ReactNode;
  description: string;
  icon?: any;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, highlight, description, icon: Icon, action }: PageHeaderProps) => {
  return (
    <div className="-mx-4 md:-mx-6 mb-6">
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-dark-card px-6 md:px-10 py-6 md:py-8 min-h-[140px] rounded-b-2xl">
        
        {/* Abstract Circles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Dark Circle (Right/Bottom) */}
          <div className="absolute top-[-10%] right-[-5%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-[#0f172a] dark:bg-[#111111] rounded-full shadow-lg" />
          
          {/* Green Circle 1 (Top/Middle) */}
          <div className="absolute top-[-50%] right-[10%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-[#10b981] dark:bg-emerald-500 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)]" />
          
          {/* Green Circle 2 (Overlapping) */}
          <div className="absolute top-[-20%] right-[2%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-[#10b981] dark:bg-emerald-500 rounded-full shadow-[-10px_10px_30px_rgba(0,0,0,0.2)] border border-emerald-400/50" />
        </div>

        {/* Content */}
        <div className="flex items-center gap-5 relative z-10">
          {Icon && (
            <div className="hidden sm:flex p-3.5 bg-slate-50 dark:bg-accent-500/10 rounded-2xl text-slate-800 dark:text-accent-300 border border-slate-200 dark:border-accent-500/20 shadow-sm">
              <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white tracking-[0.2em] uppercase">
              {title}
            </h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              {highlight && (
                <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                  {highlight}
                </span>
              )}
              {description && (
                <p className="text-sm font-medium text-slate-500 dark:text-accent-200 max-w-md">
                  {highlight && <span className="hidden sm:inline mx-1 text-slate-300 dark:text-slate-600">|</span>}
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {action && (
          <div className="relative z-10 flex items-center mt-4 md:mt-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
