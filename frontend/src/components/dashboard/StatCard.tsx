import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => {
  return (
    <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-2">{title}</p>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">{value}</h3>
          
          {trend && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20'} px-2.5 py-1 rounded-full w-fit`}>
              <span className="text-xs">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1 font-normal text-xs">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-primary-50 dark:from-blue-900/40 dark:to-primary-900/20 rounded-2xl shadow-inner border border-white/50 dark:border-white/5">
          <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  );
};
