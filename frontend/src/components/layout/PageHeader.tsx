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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-xl p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm relative z-20 mb-1">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        {Icon && (
          <div className="hidden sm:flex p-2.5 bg-accent-50 dark:bg-accent-500/10 rounded-xl text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-500/10">
            <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
        )}
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
            {title} {highlight && <span className="text-accent-500">{highlight}</span>}
          </h1>
          <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{description}</p>
        </div>
      </div>

      {action && (
        <div className="relative z-10 flex items-center h-10 lg:h-11">
          {action}
        </div>
      )}
    </div>
  );
};
