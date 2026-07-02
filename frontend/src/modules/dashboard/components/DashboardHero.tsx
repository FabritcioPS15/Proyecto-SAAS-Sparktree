import React from 'react';
import { motion } from 'framer-motion';
import { Play, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const DashboardHero = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Buenos días, Fabritcio <span className="animate-wave origin-bottom-right inline-block">👋</span>
        </h1>
        <p className="text-slate-500 font-medium text-base">
          Todo está funcionando correctamente en tu ecosistema inteligente.
        </p>
        
        {/* Quick Summary Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Badge icon={<Activity className="w-3 h-3" />} text="99.9% Uptime" color="emerald" />
          <Badge icon={<span className="w-2 h-2 rounded-full bg-blue-500" />} text="134 conversaciones hoy" color="blue" />
          <Badge text="5 canales activos" color="slate" />
          <Badge icon={<AlertCircle className="w-3 h-3" />} text="0 alertas críticas" color="slate" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-4 py-2.5 bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          Ver Analíticas
        </button>
        <button className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
          <Play className="w-4 h-4" />
          Crear Flujo
        </button>
      </div>
    </motion.div>
  );
};

function Badge({ text, icon, color }: { text: string, icon?: React.ReactNode, color: 'emerald' | 'blue' | 'slate' | 'red' }) {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    blue: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    slate: "bg-slate-100 text-slate-600 border-slate-200/50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-white/5",
    red: "bg-red-50 text-red-700 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border", colorStyles[color])}>
      {icon}
      {text}
    </div>
  );
}
