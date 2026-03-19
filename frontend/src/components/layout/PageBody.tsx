import { ReactNode } from 'react';

interface PageBodyProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

/**
 * Standard body container for a page.
 * Usually contains the scrollable content area below the PageHeader.
 */
export const PageBody = ({ children, className = "", scrollable = true }: PageBodyProps) => {
  return (
    <div className={`flex-1 bg-white dark:bg-[#11141b]/50 backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-gray-800/50 shadow-xl relative overflow-hidden flex flex-col min-h-0 ${className}`}>
      {/* Decorative Background Element */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none transition-all duration-700" />
      
      <div className={`flex-1 p-4 lg:p-6 ${scrollable ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'} relative z-10`}>
        {children}
      </div>
    </div>
  );
};
