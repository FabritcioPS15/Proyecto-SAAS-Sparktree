import { useState, useEffect } from 'react';
import { Users, MessageSquare, UserPlus, Activity, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../services/api';
import { useLayout } from '../components/layout/Layout';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

const initialStats = {
  totalUsers: 0,
  totalInteractions: 0,
  messagesToday: 0,
  newUsersToday: 0,
  botResponses: 0,
  botResponsesToday: 0
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useLayout();
  const [stats, setStats] = useState(initialStats);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAnalytics();
        const isConnected = data?.whatsapp?.connected || false;
        setWhatsappConnected(isConnected);

        if (data && data.stats) {
          setStats({
            totalUsers: data.stats.totalUsers || 0,
            totalInteractions: isConnected ? (data.stats.whatsappMessages || 0) : (data.stats.totalMessages || 0),
            messagesToday: isConnected ? (data.stats.whatsappMessagesToday || 0) : (data.stats.messagesToday || 0),
            newUsersToday: data.stats.newUsersToday || 0,
            botResponses: isConnected ? (data.stats.whatsappResponses || 0) : (data.stats.botResponses || Math.floor((data.stats.totalMessages || 0) * 0.7)),
            botResponsesToday: isConnected ? (data.stats.whatsappResponsesToday || 0) : (data.stats.botResponsesToday || Math.floor((data.stats.messagesToday || 0) * 0.7))
          });
        }

        const generateMessagesData = (timeRange: string, customStart?: string, customEnd?: string) => {
          const data = [];
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          
          let start: Date;
          let end: Date = today;
          
          if (timeRange === 'custom' && customStart && customEnd) {
            start = new Date(customStart);
            end = new Date(customEnd);
          } else {
            const days = timeRange === '7d' ? 7 : 30;
            start = new Date(today);
            start.setDate(start.getDate() - days + 1);
          }
          
          const currentDate = new Date(start);
          while (currentDate <= end) {
            const baseValue = isConnected ? 80 + Math.random() * 120 : 150 + Math.random() * 100;
            const weekendMultiplier = (currentDate.getDay() === 0 || currentDate.getDay() === 6) ? 0.7 : 1;
            const value = Math.floor(baseValue * weekendMultiplier * (1 + Math.random() * 0.3));
            data.push({
              date: currentDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
              value: value
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return data;
        };

        setMessagesData(generateMessagesData(selectedTimeRange, startDate, endDate));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedTimeRange, startDate, endDate, whatsappConnected]);

  if (loading) return <PageLoader sectionName="Panel de Control" />;

  return (
    <PageContainer>
      <PageBody>
        <div className="space-y-4">
          {/* Header Card */}
          <div className="relative group overflow-hidden bg-white dark:bg-[#11141b]/50 backdrop-blur-xl p-6 lg:p-7 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-lg duration-700">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-black dark:bg-accent-500 text-accent-500 dark:text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">Dashboard</span>
                  <span className="flex items-center gap-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" /> Sistema Ready
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  Bienvenido de <span className="text-accent-500">Nuevo</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg font-medium max-w-2xl leading-relaxed">
                  Tu ecosistema inteligente está operando al <span className="text-slate-900 dark:text-white font-black">99.9%</span>. Has tenido <span className="text-accent-500 font-black">+{stats.newUsersToday} ingresos</span> hoy.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="bg-white dark:bg-black px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center min-w-[150px] transition-all cursor-pointer" onClick={() => navigate('/analytics')}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Global</p>
                  <p className="text-lg font-black text-accent-500 tracking-tight">Activo</p>
                </div>
                <div className="bg-black dark:bg-accent-500 px-6 py-4 rounded-2xl text-center min-w-[150px] shadow-lg transition-all cursor-pointer" onClick={() => navigate('/reports')}>
                  <p className="text-[9px] font-black text-slate-400 dark:text-black uppercase tracking-widest mb-1">Latencia</p>
                  <p className="text-2xl font-black text-white dark:text-black tracking-tighter">1.32<small className="text-sm opacity-60">s</small></p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-2 gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
            {[
              { icon: Users, label: 'Usuarios', value: stats.totalUsers, color: 'accent', desc: 'Total registrados', path: '/users' },
              { icon: MessageSquare, label: whatsappConnected ? 'WhatsApp' : 'Mensajes', value: stats.totalInteractions, color: 'accent', desc: 'Mensajes totales', path: '/conversations' },
              { icon: Activity, label: 'Bot Resp.', value: stats.botResponses, color: 'accent', desc: 'IA Activa', path: '/analytics' },
              { icon: UserPlus, label: 'Nuevos', value: stats.newUsersToday, color: 'accent', desc: 'Ingresos hoy', path: '/leads' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white dark:bg-[#11141b] rounded-xl p-3.5 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <div className="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-500">
                      <item.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                    {item.value.toLocaleString()}
                  </h2>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Status Area */}
          <div className="bg-white dark:bg-[#11141b] rounded-xl p-4 border border-gray-100 dark:border-gray-800/50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${whatsappConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">
                  {whatsappConnected ? 'Conexión WhatsApp Activa' : 'WhatsApp Desconectado'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Canal de comunicación en tiempo real</p>
              </div>
            </div>
            {!whatsappConnected && (
              <button 
                className="px-4 py-2 bg-accent-500 text-black rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md"
                onClick={() => navigate('/whatsapp-qr')}
              >
                Conectar
              </button>
            )}
          </div>

          {/* Charts and Side Section */}
          <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${isSidebarCollapsed ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
            <div className={`${isSidebarCollapsed ? 'xl:col-span-3' : 'xl:col-span-2'} space-y-4`}>
              <div className="bg-white dark:bg-[#11141b] rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Interacciones</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Crecimiento de Mensajes</p>
                  </div>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800/30 rounded-xl p-1 border border-slate-100 dark:border-slate-700/50 h-10">
                    {['7d', '30d', 'custom'].map((range) => (
                      <button 
                        key={range}
                        className={`px-4 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedTimeRange === range ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-accent-500'}`}
                        onClick={() => {
                          setSelectedTimeRange(range);
                          setShowCustomRange(range === 'custom');
                        }}
                      >
                        {range === '7d' ? 'Semana' : range === '30d' ? 'Mes' : 'Personalizado'}
                      </button>
                    ))}
                  </div>
                </div>

                {showCustomRange && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                      <div className="flex-1 relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all"
                        />
                      </div>
                      <span className="hidden sm:block text-[9px] font-black text-slate-300 tracking-tighter">AL</span>
                      <div className="flex-1 relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-[220px] sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={messagesData}>
                      <defs>
                        <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.2} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.05} vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={15} fontSize={9} fontWeight={700} />
                      <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={10} fontSize={9} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '10px', padding: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '8px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '800' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} fill="url(#areaColor)" activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-black rounded-xl p-5 text-white overflow-hidden relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-3.5 h-3.5 text-accent-500" />
                    <h4 className="text-[10px] font-black tracking-widest uppercase">Sparktree Engine</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/50 tracking-widest">
                      <span>Performance v2.4</span>
                      <span className="text-emerald-500">Stable</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full"><div className="h-full w-[94%] bg-accent-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" /></div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#11141b] rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white tracking-tight leading-none">Plan Enterprise Plus</h4>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1.5">Suscripción Activa</p>
                  </div>
                  <button className="mt-4 w-full h-10 bg-slate-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-100 dark:border-white/5 hover:bg-black hover:text-white" onClick={() => navigate('/billing')}>
                    Gestionar Cuenta
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Resumen de Actividad</h4>
                <div className="space-y-3">
                  {[
                    { icon: MessageSquare, label: 'Mensajes Hoy', value: stats.messagesToday },
                    { icon: Activity, label: 'Respuesta Bot', value: stats.botResponsesToday }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#11141b] rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <div className="p-1.5 bg-accent-500/10 rounded-lg text-accent-500">
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                        {item.value.toLocaleString()}
                      </h2>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0c10] rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent-500 rounded-lg text-black">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black tracking-tight leading-tight uppercase">Soporte VIP</h4>
                </div>
                <div className="space-y-2 mb-6">
                  {['Prioridad Máxima', 'Soporte 24/7'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                      <span className="text-[10px] font-black uppercase tracking-wide opacity-80">{text}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full h-10 bg-white/10 hover:bg-white hover:text-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5" onClick={() => navigate('/billing')}>
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </PageContainer>
  );
};
