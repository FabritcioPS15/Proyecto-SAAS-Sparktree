import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    
    const variants = {
      default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
      info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
