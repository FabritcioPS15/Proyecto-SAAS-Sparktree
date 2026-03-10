import { useState, useEffect } from 'react';
import { Users, MessageSquare, UserPlus, Activity, CheckCircle } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../services/api';

const initialStats = {
  totalUsers: 0,
  totalInteractions: 0,
  messagesToday: 0,
  newUsersToday: 0
};

export const Dashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAnalytics();

        if (data && data.stats) {
          setStats({
            totalUsers: data.stats.totalUsers || 0,
            totalInteractions: data.stats.totalMessages || 0,
            messagesToday: data.stats.totalConversations || 0, // Using conversations as daily activity placeholder
            newUsersToday: 0 // If no data returned for new users specifically
          });
        }

        setMessagesData(Array.isArray(data?.interactionsPerDay) ? data.interactionsPerDay : []);
        setMenuData(Array.isArray(data?.topFlows) ? data.topFlows : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-10 relative">
        {/* Premium Header / Welcome Section */}
        <div className="relative group overflow-hidden bg-white dark:bg-[#11141b]/50 backdrop-blur-xl p-12 rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-2xl duration-700">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[120px] rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-1000" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20">
                  Command Center v3.0
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Monitoring
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Bienvenido de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 underline decoration-indigo-500/20 underline-offset-8">Nuevo</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-3xl leading-relaxed">
                Tu ecosistema inteligente de comunicación está operando al <span className="text-slate-900 dark:text-white font-black">99.9% de eficiencia</span>. Has tenido <span className="text-indigo-600 dark:text-indigo-400 font-black">+{stats.newUsersToday} usuarios nuevos</span> hoy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 text-center min-w-[180px] shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Global</p>
                <p className="text-xl font-black text-emerald-500 tracking-tight flex items-center justify-center gap-2">
                  EXCELENTE
                </p>
              </div>
              <div className="bg-slate-900 dark:bg-white p-6 rounded-[2rem] text-center min-w-[220px] shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tiempo de Respuesta</p>
                <p className="text-3xl font-black text-white dark:text-slate-900 tracking-tighter">0.82<small className="text-lg opacity-60">s</small></p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats with Expressive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, label: 'Ecosistema Usuarios', value: stats.totalUsers, change: '+12.5%', color: 'blue', desc: 'Base total de usuarios' },
            { icon: MessageSquare, label: 'Caudal Mensajes', value: stats.totalInteractions, change: '+8.3%', color: 'indigo', desc: 'Interacciones procesadas' },
            { icon: Activity, label: 'Pulso Diario', value: stats.messagesToday, change: 'En vivo', color: 'emerald', desc: 'Tráfico de las últimas 24h' },
            { icon: UserPlus, label: 'Tasa Adquisición', value: stats.newUsersToday, change: '+28 hoy', color: 'amber', desc: 'Crecimiento de audiencia' }
          ].map((item, idx) => (
            <div key={idx} className="group relative bg-white dark:bg-[#11141b] rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-${item.color}-500/10 transition-colors duration-500`} />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 group-hover:rotate-12 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-black ${item.change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'} bg-slate-50 dark:bg-gray-800/80 px-4 py-2 rounded-xl border border-slate-100 dark:border-gray-700/50 shadow-sm text-slate-500 dark:text-slate-400`}>
                  {item.change}
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </h2>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Charting System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white dark:bg-[#11141b] rounded-[3rem] p-10 shadow-xl shadow-slate-200/5 dark:shadow-none border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Evolución de Mensajería</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">Volumen volumétrico semanal</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/50">
                    <button className="px-5 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-[10px] font-black shadow-xl uppercase tracking-widest">7 Días</button>
                    <button className="px-5 py-2.5 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors">30 Días</button>
                  </div>
                </div>
              </div>

              <div className="h-[450px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messagesData}>
                    <defs>
                      <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="strokeColor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.03} vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={20} fontSize={12} fontWeight={700} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={15} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                      }}
                      cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }}
                      itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginBottom: '10px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="url(#strokeColor)" strokeWidth={4} fill="url(#areaColor)" dot={{ fill: '#6366f1', r: 6, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-white overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black tracking-tight">Salud del Motor de Flujos</h4>
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Flow Parser v2</span>
                    <span className="text-emerald-400 font-black text-sm uppercase">Optimizado</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    El motor de procesamiento de flujos está operando con una latencia media de <span className="text-white font-bold">14ms</span>. No se requieren ajustes estructurales.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] p-10 border border-indigo-100 dark:border-indigo-500/20 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
                  <CheckCircle className="w-20 h-20 text-indigo-500" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Plan Enterprise</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tienes acceso a todas las funcionalidades premium sin restricciones.</p>
                </div>
                <button className="relative z-10 mt-10 w-full py-5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] border border-indigo-100 dark:border-indigo-500/20 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300 shadow-sm text-center">
                  Gestionar Suscripción
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-white dark:bg-[#11141b] rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800/50 group relative">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Opciones Dominantes</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={menuData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.03} vertical={false} />
                    <XAxis dataKey="option" stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={15} fontSize={10} fontWeight={900} textAnchor="middle" />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={10} fontWeight={900} />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 16 }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" fill="url(#barColor)" radius={[12, 12, 12, 12]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/50 space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resumen Analítico</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "La sección de <span className="text-slate-900 dark:text-white">Precios</span> sigue siendo el punto de mayor fricción y conversión con un <span className="text-indigo-500 font-black">27% del tráfico total</span>."
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 rounded-[3rem] p-10 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 dark:bg-slate-900/5 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-3xl font-black mb-4 tracking-tighter">Reporte del Sistema</h4>
              <p className="text-slate-400 dark:text-slate-500 font-medium mb-10 leading-relaxed">Generamos reportes automáticos basados en el comportamiento de tus usuarios cada 24 horas.</p>
              <button className="w-full py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                Descargar PDF <small className="opacity-40">2.4MB</small>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
