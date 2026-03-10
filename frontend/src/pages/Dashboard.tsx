import { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, UserPlus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../components/dashboard/StatCard';
import { getAnalytics } from '../services/api';

const initialStats = {
  totalUsers: 0,
  totalInteractions: 0,
  messagesToday: 0,
  newUsersToday: 0
};

export const Dashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [messagesData, setMessagesData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {
    getAnalytics().then(data => {
      // Aquí se procesarán los datos reales cuando el backend envíe las analíticas
      if (data && data.length > 0) {
        // setStats(...)
      }
    }).catch(err => console.error("Error fetching analytics", err));
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Resumen y Analíticas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Métricas de rendimiento de tu ChatBot en tiempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios Totales"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Interacciones"
          value={stats.totalInteractions}
          icon={MessageSquare}
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard
          title="Mensajes Hoy"
          value={stats.messagesToday}
          icon={TrendingUp}
          trend={{ value: 15.2, isPositive: true }}
        />
        <StatCard
          title="Nuevos Usuarios"
          value={stats.newUsersToday}
          icon={UserPlus}
          trend={{ value: 3.1, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Mensajes por Día</h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">Últimos 7 días</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesData}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(75, 85, 99, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
                />
                <Line type="monotone" dataKey="value" stroke="url(#lineColor)" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Opciones de Menú Populares</h3>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">Top 4</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={menuData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                   <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#3b82f6" opacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} vertical={false} />
                <XAxis dataKey="option" stroke="#9CA3AF" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(75, 85, 99, 0.4)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="url(#barColor)" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Crecimiento de Nuevos Usuarios</h3>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">Mensual</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
