import { useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockInteractionsPerDay, mockTopFlows, mockActiveUsers } from '../data/mockData';
import { getAnalytics } from '../services/api';

export const Analytics = () => {
  useEffect(() => {
    getAnalytics().then(res => console.log("Analytics data connected:", res)).catch(err => console.error(err));
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Analíticas Avanzadas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Información detallada sobre el uso de tu chatbot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden text-center group">
           <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Tiempo de Respuesta</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">1.2s</p>
          <p className="text-xs text-emerald-500 mt-2 font-medium">Un 15% más rápido hoy</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden text-center group">
           <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Satisfacción de Usuario</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">94%</p>
          <p className="text-xs text-emerald-500 mt-2 font-medium">Sólido</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden text-center group">
           <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Tasa de Finalización</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">87%</p>
          <p className="text-xs text-rose-500 mt-2 font-medium">Bajó un 2% estadísticamente</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          Interacciones por Día
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockInteractionsPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                  <linearGradient id="interactionColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#34D399" />
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
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
              />
              <Line type="monotone" dataKey="value" stroke="url(#interactionColor)" strokeWidth={3} dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Flujos Más Utilizados</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTopFlows} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                   <linearGradient id="flowColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                <YAxis dataKey="option" type="category" stroke="#9CA3AF" axisLine={false} tickLine={false} width={100} />
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
                <Bar dataKey="count" fill="url(#flowColor)" radius={[0, 6, 6, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            Usuarios Activos
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockActiveUsers} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FCD34D" />
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
                    color: '#fff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
                />
                <Line type="monotone" dataKey="value" stroke="url(#activeColor)" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
