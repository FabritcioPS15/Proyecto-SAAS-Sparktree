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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm relative z-20 mb-0">
      {/* Background purely decorative element - contained within its own overflow hidden if needed */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none overflow-hidden" />

      <div className="flex items-center gap-4 relative z-10">
        {Icon && (
          <div className="hidden sm:flex p-3 bg-primary-50 dark:bg-primary-500/10 rounded-2xl text-primary-600 dark:text-primary-400">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {title} {highlight && <span className="text-primary-600 dark:text-primary-400">{highlight}</span>}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{description}</p>
        </div>
      </div>

      {action && (
        <div className="relative z-10">
          {action}
        </div>
      )}
    </div>
  );
};
