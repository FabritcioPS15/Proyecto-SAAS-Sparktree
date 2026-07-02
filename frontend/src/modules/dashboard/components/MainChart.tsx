import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

interface MainChartProps {
  data: any[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  showCustomRange: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const MainChart: React.FC<MainChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
  showCustomRange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <DashboardCard
      title="Interacciones"
      subtitle="Volumen de mensajes en el ecosistema"
      action={
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          {['7d', '30d', 'custom'].map((range) => (
            <button
              key={range}
              onClick={() => onRangeChange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedRange === range 
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {range === '7d' ? 'Semana' : range === '30d' ? 'Mes' : 'Pers.'}
            </button>
          ))}
        </div>
      }
      className="col-span-full xl:col-span-2 min-h-[400px]"
    >
      {showCustomRange && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <div className="flex-1 relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all"
              />
            </div>
            <span className="hidden sm:block text-xs font-bold text-slate-400">a</span>
            <div className="flex-1 relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#41f0a5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#41f0a5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                color: '#fff',
                fontWeight: 600
              }}
              itemStyle={{ color: '#41f0a5' }}
              cursor={{ stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#41f0a5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#41f0a5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};
