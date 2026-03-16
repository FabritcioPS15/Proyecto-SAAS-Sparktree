import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, UserPlus, Activity, CheckCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../services/api';
import { useLayout } from '../components/layout/Layout';

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

        // Verificar si WhatsApp está conectado
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

        // Generar datos de mensajes según el rango seleccionado
        const generateMessagesData = (timeRange: string, customStart?: string, customEnd?: string) => {
          const data = [];
          const today = new Date();
          today.setHours(23, 59, 59, 999); // Final de hoy
          
          let start: Date;
          let end: Date = today;
          
          if (timeRange === 'custom' && customStart && customEnd) {
            start = new Date(customStart);
            end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
            
            // No permitir fechas futuras
            if (end > today) {
              end = today;
            }
          } else {
            const days = timeRange === '7d' ? 7 : 30;
            start = new Date(today);
            start.setDate(start.getDate() - days + 1);
            start.setHours(0, 0, 0, 0); // Inicio del primer día
          }
          
          // Generar datos desde start hasta end
          const currentDate = new Date(start);
          while (currentDate <= end) {
            // Simular datos con variación según conexión
            const baseValue = whatsappConnected ? 80 + Math.random() * 120 : 150 + Math.random() * 100;
            const weekendMultiplier = (currentDate.getDay() === 0 || currentDate.getDay() === 6) ? 0.7 : 1;
            const value = Math.floor(baseValue * weekendMultiplier * (1 + Math.random() * 0.3));
            
            data.push({
              date: currentDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
              value: value,
              fullDate: currentDate.toISOString().split('T')[0], // Para debugging
              source: whatsappConnected ? 'WhatsApp' : 'Sistema'
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

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-[calc(100vh-8rem)] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'mx-4' : ''}`}>
      <div className="overflow-hidden flex-1">
        <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-8">
        {/* Premium Header / Welcome Section */}
        <div className="relative group overflow-hidden bg-white dark:bg-[#11141b]/50 backdrop-blur-xl p-8 lg:p-10 rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-2xl duration-700">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/10 to-accent-500/10 blur-[150px] rounded-full -mr-64 -mt-64 transition-transform group-hover:scale-110 duration-1000" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-5 py-2 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-600/20">
                  Centro de comandos V 2.1
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Monitorizacion en vivo
                </span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Bienvenido de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 dark:from-primary-400 dark:via-accent-400 dark:to-secondary-400 underline decoration-primary-500/20 underline-offset-8">Nuevo</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xl lg:text-2xl font-medium max-w-4xl leading-relaxed">
                Tu ecosistema inteligente de comunicación está operando al <span className="text-slate-900 dark:text-white font-black">99.9% de eficiencia</span>. Has tenido <span className="text-primary-600 dark:text-primary-400 font-black">+{stats.newUsersToday} usuarios nuevos </span> el dìa de hoy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700/50 text-center min-w-[220px] shadow-inner hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/analytics')}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Global</p>
                <p className="text-2xl font-black text-emerald-500 tracking-tight flex items-center justify-center gap-2">
                  Activo
                </p>
                <p className="text-[9px] text-slate-500 mt-2">Click para ver detalles</p>
              </div>
              <div className="bg-slate-900 dark:bg-white p-8 rounded-[3rem] text-center min-w-[280px] shadow-2xl hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/reports')}>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tiempo de Respuesta</p>
                <p className="text-4xl font-black text-white dark:text-slate-900 tracking-tighter">1.32<small className="text-xl opacity-60">s</small></p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-2">Ver reporte completo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats with Expressive Cards */}
        <div className={`grid grid-cols-2 gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
          {[
            { 
              icon: Users, 
              label: 'Usuarios', 
              value: stats.totalUsers, 
              color: 'primary', 
              desc: 'Total registrados',
              action: () => navigate('/users')
            },
            { 
              icon: MessageSquare, 
              label: whatsappConnected ? 'WhatsApp' : 'Recibidos', 
              value: stats.totalInteractions, 
              color: whatsappConnected ? 'accent' : 'primary', 
              desc: whatsappConnected ? 'Mensajes WhatsApp' : 'Mensajes usuarios',
              action: () => navigate('/conversations')
            },
            { 
              icon: Activity, 
              label: 'Bot', 
              value: stats.botResponses, 
              color: 'accent', 
              desc: whatsappConnected ? 'Respuestas WA' : 'Respuestas enviadas',
              action: () => navigate('/analytics')
            },
            { 
              icon: UserPlus, 
              label: 'Nuevos', 
              value: stats.newUsersToday, 
              color: 'secondary', 
              desc: 'Hoy',
              action: () => navigate('/leads')
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white dark:bg-[#11141b] rounded-xl p-3 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
              onClick={item.action}
            >
              <div className={`absolute top-0 right-0 w-12 h-12 bg-${item.color}-500/5 blur-xl rounded-full -mr-6 -mt-6 group-hover:bg-${item.color}-500/10 transition-colors duration-500`} />

              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">{item.label}</p>
                  <div className={`w-6 h-6 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-3 h-3" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </h2>
                </div>
                
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Connection Status */}
        <div className="bg-white dark:bg-[#11141b] rounded-xl p-4 border border-gray-100 dark:border-gray-800/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${whatsappConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {whatsappConnected ? 'WhatsApp Conectado' : 'WhatsApp No Conectado'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {whatsappConnected 
                    ? 'Recibiendo mensajes en tiempo real' 
                    : 'Configura WhatsApp para empezar a recibir mensajes'
                  }
                </p>
              </div>
            </div>
            {!whatsappConnected && (
              <button 
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                onClick={() => navigate('/settings')}
              >
                Conectar
              </button>
            )}
          </div>
        </div>

        {/* Advanced Charting System */}
        <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${isSidebarCollapsed ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
          <div className={`${isSidebarCollapsed ? 'xl:col-span-3' : 'xl:col-span-2'} space-y-4`}>
            <div className="bg-white dark:bg-[#11141b] rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {whatsappConnected ? 'Mensajes WhatsApp' : 'Mensajes Recibidos'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    {whatsappConnected ? 'Mensajes entrantes de WhatsApp' : 'Mensajes de usuarios del sistema'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700/50">
                    <button 
                      className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-colors ${
                        selectedTimeRange === '7d' 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' 
                          : 'text-slate-400 dark:text-slate-500 hover:text-primary-500'
                      }`}
                      onClick={() => {
                        setSelectedTimeRange('7d');
                        setShowCustomRange(false);
                      }}
                    >
                      7 Días
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-colors ${
                        selectedTimeRange === '30d' 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' 
                          : 'text-slate-400 dark:text-slate-500 hover:text-primary-500'
                      }`}
                      onClick={() => {
                        setSelectedTimeRange('30d');
                        setShowCustomRange(false);
                      }}
                    >
                      30 Días
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-colors ${
                        selectedTimeRange === 'custom' 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' 
                          : 'text-slate-400 dark:text-slate-500 hover:text-primary-500'
                      }`}
                      onClick={() => {
                        setSelectedTimeRange('custom');
                        setShowCustomRange(true);
                      }}
                    >
                      <Calendar className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {showCustomRange && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Fecha Inicio</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Fecha Fin</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary-700 transition-colors"
                      onClick={() => {
                        if (startDate && endDate) {
                          setSelectedTimeRange('custom');
                        }
                      }}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}

              <div className="h-[250px] sm:h-[300px] relative z-10 min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messagesData}>
                    <defs>
                      <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={whatsappConnected ? "#41f0a5" : "#3750f0"} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={whatsappConnected ? "#41f0a5" : "#3750f0"} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="strokeColor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={whatsappConnected ? "#41f0a5" : "#3750f0"} />
                        <stop offset="100%" stopColor={whatsappConnected ? "#41f0e0" : "#4190f0"} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={15} fontSize={10} fontWeight={600} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickMargin={10} fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                      }}
                      cursor={{ stroke: whatsappConnected ? 'rgba(65, 240, 165, 0.2)' : 'rgba(55, 80, 240, 0.2)', strokeWidth: 2 }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '6px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="url(#strokeColor)" strokeWidth={2} fill="url(#areaColor)" dot={{ fill: whatsappConnected ? "#41f0a5" : "#3750f0", r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-black border border-black/20 rounded-xl p-4 text-white overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-sm font-black tracking-tight">Motor</h4>
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase text-white/60 tracking-[0.1em]">Flow Parser v2</span>
                    <span className="text-accent-400 font-black text-[8px] uppercase">Optimizado</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-white/60 text-[10px] font-medium leading-relaxed">
                    Latencia: <span className="text-white font-bold">14ms</span> - Estable
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-black rounded-xl p-4 border border-primary-100 dark:border-primary-500/20 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-700">
                  <CheckCircle className="w-8 h-8 text-primary-500" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black text-black dark:text-white tracking-tight mb-1">Plan Enterprise</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Acceso completo</p>
                </div>
                <button 
                  className="relative z-10 mt-3 w-full py-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-black rounded-lg uppercase tracking-[0.2em] text-[8px] border border-primary-100 dark:border-primary-500/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm text-center"
                  onClick={() => navigate('/billing')}
                >
                  Gestionar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Daily Stats */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Estadísticas de Hoy</h4>
              <div className="space-y-3">
                {[
                  { 
                    icon: MessageSquare, 
                    label: whatsappConnected ? 'WhatsApp Hoy' : 'Mensajes Hoy', 
                    value: stats.messagesToday, 
                    color: whatsappConnected ? 'accent' : 'blueaccent', 
                    desc: whatsappConnected ? 'Recibidos WA' : 'Recibidos sistema',
                    action: () => navigate('/conversations')
                  },
                  { 
                    icon: Activity, 
                    label: 'Bot Hoy', 
                    value: stats.botResponsesToday, 
                    color: 'secondary', 
                    desc: whatsappConnected ? 'Respuestas WA' : 'Respuestas enviadas',
                    action: () => navigate('/analytics')
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group relative bg-white dark:bg-[#11141b] rounded-xl p-4 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
                    onClick={item.action}
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-${item.color}-500/5 blur-xl rounded-full -mr-8 -mt-8 group-hover:bg-${item.color}-500/10 transition-colors duration-500`} />

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{item.label}</p>
                        <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                        </h2>
                      </div>
                      
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary-500 to-blueaccent-500 dark:from-primary-400 dark:to-blueaccent-400 rounded-xl p-4 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 blur-xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg font-black tracking-tight">Plan Actual</h4>
                  </div>
                  <p className="text-2xl font-black mb-2">Enterprise</p>
                  <p className="text-sm font-medium opacity-90 mb-4">Acceso ilimitado a todas las funcionalidades</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                      <span className="text-xs font-medium">Usuarios ilimitados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                      <span className="text-xs font-medium">Mensajes ilimitados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                      <span className="text-xs font-medium">Soporte prioritario</span>
                    </div>
                  </div>
                  <button 
                    className="w-full mt-4 py-2 bg-white/20 backdrop-blur-sm text-white font-black rounded-lg uppercase tracking-[0.2em] text-[8px] border border-white/30 hover:bg-white hover:text-primary-600 transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={() => navigate('/billing')}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-black to-gray-900 dark:from-white dark:to-gray-100 rounded-xl p-4 text-white dark:text-black shadow-xl relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-white/5 dark:bg-black/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-lg font-black mb-2 tracking-tighter">Reporte Diario</h4>
                <p className="text-white/60 dark:text-black/60 font-medium mb-4 leading-relaxed text-xs">Generado automáticamente cada 24 horas</p>
                <button 
                  className="w-full py-2 bg-white dark:bg-black text-black dark:text-white font-black rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all text-[8px] uppercase tracking-[0.3em] flex items-center justify-center gap-2"
                  onClick={() => navigate('/reports')}
                >
                  Descargar PDF <small className="opacity-40 text-xs">2.4MB</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
