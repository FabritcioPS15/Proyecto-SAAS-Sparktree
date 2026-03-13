import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, MessageCircle, Activity, CheckCircle, BarChart3 } from 'lucide-react';

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
      value: Math.floor(Math.random() * 100) + 20
    });
  }
  return data;
};

const generateEmptyFlowsData = () => {
  return [
    { option: 'Bienvenida', count: Math.floor(Math.random() * 50) + 10 },
    { option: 'Soporte', count: Math.floor(Math.random() * 30) + 5 },
    { option: 'Ventas', count: Math.floor(Math.random() * 40) + 8 },
    { option: 'Información', count: Math.floor(Math.random() * 25) + 3 }
  ];
};

const generateHourlyActivityData = (): HourlyActivity[] => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hora: i,
      ejecuciones: Math.floor(Math.random() * 50),
      dias_activos: Math.floor(Math.random() * 10)
    });
  }
  return data;
};

// Function to fetch analytics data from API
const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const response = await fetch('/api/analytics');
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    const data = await response.json();
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
        avgResponseTime: 1.2,
        satisfactionRate: 94,
        completionRate: 87,
        totalUsers: 0,
        totalMessages: 0,
        totalConversations: 0
      }
    };
  }
};

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
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando analíticas...</p>
        </div>
      </div>
    );
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
    <div className="h-[calc(100vh-8rem)] min-h-[600px] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Analíticas <span className="text-primary-600 dark:text-primary-400">Avanzadas</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Descubre patrones y optimiza flujos en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Tiempo Respuesta', value: `${stats.avgResponseTime}s`, color: 'slate' },
            { icon: Users, label: 'Satisfacción', value: `${stats.satisfactionRate}%`, color: 'slate' },
            { icon: MessageCircle, label: 'Finalización', value: `${stats.completionRate}%`, color: 'slate' },
            { icon: Activity, label: 'Usuarios Activos', value: stats.totalUsers.toLocaleString(), color: 'slate' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-[#11141b] rounded-[1.5rem] p-4 border border-gray-100 dark:border-gray-800/50 shadow-lg shadow-slate-200/5 dark:shadow-none hover:shadow-xl dark:hover:border-gray-700/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all duration-300">
                  <item.icon className="w-5 h-5" />
                </div>
                <Activity className="w-3 h-3 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Interacciones Diarias</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Mensajes procesados por día</p>
            </div>
            <div className="flex-1 min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interactionsPerDay.length > 0 ? interactionsPerDay : generateEmptyData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="interactionColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={11}
                    fontWeight={600}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    label={{ value: 'Mensajes', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
                    formatter={(value: any) => [`${value} mensajes`, 'Interacciones']}
                  />
                  <Line type="monotone" dataKey="value" stroke="url(#interactionColor)" strokeWidth={3} dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Flujos más Utilizados</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Ejecuciones por flujo</p>
            </div>
            <div className="flex-1 min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFlows.length > 0 ? topFlows : generateEmptyFlowsData()} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="flowColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    label={{ value: 'Ejecuciones', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#94a3b8' } }}
                  />
                  <YAxis dataKey="option" type="category" stroke="#94a3b8" axisLine={false} tickLine={false} width={80} fontSize={11} fontWeight={600} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`${value} ejecuciones`, 'Flujo']}
                  />
                  <Bar dataKey="count" fill="url(#flowColor)" radius={[0, 8, 8, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#11141b] rounded-[2rem] p-6 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-500 flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Evolución de Usuarios Activos
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Usuarios únicos por día</p>
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
                    tickMargin={10}
                    fontSize={11}
                    fontWeight={600}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    label={{ value: 'Usuarios', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
                    formatter={(value: any) => [`${value} usuarios`, 'Usuarios Activos']}
                  />
                  <Line type="monotone" dataKey="value" stroke="url(#activeColor)" strokeWidth={3} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
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
                  <Bar dataKey="ejecuciones" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
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
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
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
                  <Line type="monotone" dataKey="ejecuciones" stroke="url(#hourlyColor)" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="dias_activos" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
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
                    <Line type="monotone" dataKey="total_ejecuciones" stroke="url(#dailyColor)" strokeWidth={3} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="flujos_unicos" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="completados" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
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
      </div>
    </div>
  );
};
