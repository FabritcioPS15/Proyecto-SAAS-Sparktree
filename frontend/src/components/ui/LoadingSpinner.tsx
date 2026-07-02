import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner = ({ size = 'md', fullPage = false, className, ...props }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <Loader2 className={cn("animate-spin text-primary-500", sizes[size])} />
  );

  if (fullPage) {
    return (
      <div className={cn("fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm z-50", className)} {...props}>
        {spinner}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)} {...props}>
      {spinner}
    </div>
  );
};
