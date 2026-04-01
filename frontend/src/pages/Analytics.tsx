import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, MessageCircle, Activity, CheckCircle, BarChart3 } from 'lucide-react';
import { getAnalytics } from '../services/api';

interface HourlyActivity {
  hora: number;
  ejecuciones?: number;
  dias_activos?: number;
}

interface AnalyticsData {
  interactionsPerDay: any[];
  topFlows: any[];
  activeUsers: any[];
  weeklySummary: any[];
  dailyFlowSummary: any[];
  hourlyActivity: HourlyActivity[];
  stats: {
    avgResponseTime: number;
    satisfactionRate: number;
    completionRate: number;
    totalUsers: number;
    totalMessages: number;
    totalConversations: number;
  };
}

// Helper functions to generate empty data when API returns no data
const generateEmptyData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString(),
      value: 0
    });
  }
  return data;
};

const generateEmptyFlowsData = () => {
  return [];
};

const generateHourlyActivityData = (): HourlyActivity[] => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hora: i,
      ejecuciones: 0,
      dias_activos: 0
    });
  }
  return data;
};

// Function to fetch analytics data from API
const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const data = await getAnalytics();
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Return fallback data if API fails
    return {
      interactionsPerDay: generateEmptyData(),
      topFlows: generateEmptyFlowsData(),
      activeUsers: generateEmptyData(),
      weeklySummary: [],
      dailyFlowSummary: [],
      hourlyActivity: generateHourlyActivityData(),
      stats: {
        avgResponseTime: 0,
        satisfactionRate: 0,
        completionRate: 0,
        totalUsers: 0,
        totalMessages: 0,
        totalConversations: 0
      }
    };
  }
};

import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

export const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from API
        const analytics = await fetchAnalyticsData();
        setAnalyticsData(analytics);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('No se pudieron cargar las analíticas');
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  if (loading) {
    return <PageLoader sectionName="Analíticas" />;
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 dark:text-white font-black text-xl">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-bold uppercase tracking-widest">Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { interactionsPerDay, topFlows, activeUsers, weeklySummary, dailyFlowSummary, hourlyActivity, stats } = analyticsData;
  return (
    <PageContainer>
      <PageHeader 
        title="Analíticas"
        highlight="Avanzadas"
        description="Descubre patrones y optimiza flujos en tiempo real."
        icon={BarChart3}
      />

      <PageBody scrollable={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          {[
            { icon: TrendingUp, label: 'Tiempo Respuesta', value: `${stats.avgResponseTime}s`, color: 'slate' },
            { icon: Users, label: 'Satisfacción', value: `${stats.satisfactionRate}%`, color: 'slate' },
            { icon: MessageCircle, label: 'Finalización', value: `${stats.completionRate}%`, color: 'slate' },
            { icon: Activity, label: 'Usuarios Activos', value: stats.totalUsers.toLocaleString(), color: 'slate' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/40 dark:bg-black/20 rounded-3xl p-5 border border-slate-100 dark:border-white/5 hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-500/5 blur-2xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2.5 bg-white dark:bg-black rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-black group-hover:text-accent-500 dark:group-hover:bg-accent-500 dark:group-hover:text-black transition-all duration-300 shadow-sm border border-slate-50 dark:border-white/10">
                  <item.icon className="w-5 h-5" />
                </div>
                <Activity className="w-3 h-3 text-accent-500/30" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
          <div className="bg-white/40 dark:bg-slate-800/20 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/30 hover:shadow-xl transition-all duration-500 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Interacciones Diarias</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Mensajes procesados</p>
            </div>
            <div className="flex-1 min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interactionsPerDay.length > 0 ? interactionsPerDay : generateEmptyData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="interactionColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#41f0a5" />
                      <stop offset="100%" stopColor="#25d366" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={15}
                    fontSize={10}
                    fontWeight={600}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      color: '#fff',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
                  />
                  <Line type="monotone" dataKey="value" stroke="url(#interactionColor)" strokeWidth={4} dot={{ fill: '#41f0a5', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/40 dark:bg-slate-800/20 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/30 hover:shadow-xl transition-all duration-500 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span className="p-2.5 bg-emerald-500/10 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-500" /></span>
                Evolución de Usuarios Activos
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest text-right">Usuarios únicos por día</p>
            </div>
            <div className="flex-1 min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeUsers.length > 0 ? activeUsers : generateEmptyData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activeColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={15}
                    fontSize={10}
                    fontWeight={600}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
                  />
                  <Line type="monotone" dataKey="value" stroke="url(#activeColor)" strokeWidth={4} dot={{ fill: '#41f0a5', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Resumen Semanal</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Ejecuciones por semana</p>
            </div>
            <div className="h-[200px] min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySummary.length > 0 ? weeklySummary.map(w => ({
                  week: `Sem ${new Date(w.semana).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`,
                  ejecuciones: w.total_ejecuciones || 0,
                  completados: w.completados || 0,
                  tasa_exito: w.tasa_exito || 0
                })) : []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={11}
                    fontWeight={600}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    label={{ value: 'Ejecuciones', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name?: string | number) => {
                      if (name === 'ejecuciones') return [`${value} ejecuciones`, 'Total'];
                      if (name === 'completados') return [`${value} completados`, 'Completados'];
                      if (name === 'tasa_exito') return [`${value}%`, 'Tasa Éxito'];
                      return [value, name?.toString() || ''];
                    }}
                  />
                  <Bar dataKey="ejecuciones" fill="#41f0a5" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Actividad por Hora</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Ejecuciones y días activos por hora</p>
            </div>
            <div className="h-[200px] min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyActivity.length > 0 ? hourlyActivity.map(h => ({
                  hora: `${h.hora}:00`,
                  ejecuciones: h.ejecuciones || 0,
                  dias_activos: h.dias_activos || 0
                })) : []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourlyColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#41f0a5" />
                      <stop offset="100%" stopColor="#222" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                  <XAxis
                    dataKey="hora"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={11}
                    fontWeight={600}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name?: string | number) => {
                      if (name === 'ejecuciones') return [`${value} ejecuciones`, 'Ejecuciones'];
                      if (name === 'dias_activos') return [`${value} días`, 'Días Activos'];
                      return [value, name?.toString() || ''];
                    }}
                  />
                  <Line type="monotone" dataKey="ejecuciones" stroke="url(#hourlyColor)" strokeWidth={3} dot={{ fill: '#41f0a5', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="dias_activos" stroke="#222" strokeWidth={2} dot={{ fill: '#222', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Ejecuciones Diarias</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Ejecuciones y flujos únicos por día</p>
              </div>
              <div className="h-[200px] min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyFlowSummary.length > 0 ? dailyFlowSummary.map(d => ({
                    dia: new Date(d.dia).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                    total_ejecuciones: d.total_ejecuciones || 0,
                    flujos_unicos: d.flujos_unicos || 0,
                    completados: d.completados || 0
                  })) : []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dailyColor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                    <XAxis
                      dataKey="dia"
                      stroke="#94a3b8"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      fontSize={11}
                      fontWeight={600}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={11}
                      label={{ value: 'Ejecuciones', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    formatter={(value: any, name?: string | number) => {
                        if (name === 'total_ejecuciones') return [`${value} ejecuciones`, 'Total Ejecuciones'];
                        if (name === 'flujos_unicos') return [`${value} flujos`, 'Flujos Únicos'];
                        if (name === 'completados') return [`${value} completados`, 'Completados'];
                        return [value, name?.toString() || ''];
                      }}
                    />
                    <Line type="monotone" dataKey="total_ejecuciones" stroke="url(#dailyColor)" strokeWidth={3} dot={{ fill: '#41f0a5', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="flujos_unicos" stroke="#222" strokeWidth={2} dot={{ fill: '#222', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="completados" stroke="#888" strokeWidth={2} dot={{ fill: '#888', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Tasa de Éxito Semanal</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Promedio de completion rate</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {weeklySummary.length > 0 ? Math.round(weeklySummary.reduce((sum: number, w: { tasa_exito: number }) => sum + (w.tasa_exito || 0), 0) / weeklySummary.length) : 0}%
                  </div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
                    Tasa promedio de éxito
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Basado en {weeklySummary.length} semanas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </PageContainer>
  );
};
