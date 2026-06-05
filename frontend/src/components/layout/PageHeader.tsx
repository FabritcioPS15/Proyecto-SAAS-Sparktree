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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-6 relative z-20">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="hidden sm:flex p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title} {highlight && <span className="text-emerald-600 dark:text-emerald-500">{highlight}</span>}
          </h1>
          {description && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      {action && (
        <div className="relative z-10 flex items-center">
          {action}
        </div>
      )}
    </div>
  );
};
