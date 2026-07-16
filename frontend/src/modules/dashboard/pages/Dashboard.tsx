import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Bot, Activity, Box, Zap, CreditCard, ChevronRight, UserPlus } from 'lucide-react';
import { getAnalytics } from '../../../services/api';
import { useLayout } from '../../../components/layout/Layout';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { PageLoader } from '../../../components/layout/PageLoader';
import { useConnections } from '../../../contexts/ConnectionsContext';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

import { DashboardHero } from '../components/DashboardHero';
import { MetricCard } from '../components/MetricCard';
import { AIInsights } from '../components/AIInsights';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { MainChart } from '../components/MainChart';
import { DashboardCard } from '../components/DashboardCard';

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
  const { connections } = useConnections();
  const [stats, setStats] = useState(initialStats);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  const platformData = [
    { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: 'text-emerald-500', route: '/whatsapp-qr' },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-500', route: '/instagram-config' },
    { id: 'tiktok', name: 'TikTok', icon: SiTiktok, color: 'text-slate-900 dark:text-white', route: '/tiktok-config' },
    { id: 'telegram', name: 'Telegram', icon: FaTelegram, color: 'text-blue-500', route: '/telegram-config' },
    { id: 'messenger', name: 'Messenger', icon: FaFacebookMessenger, color: 'text-blue-600', route: '/facebook-config' }
  ];

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

  const handleRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    setShowCustomRange(range === 'custom');
  };

  if (loading) return <PageLoader sectionName="Dashboard" />;

  return (
    <PageContainer>
      <PageBody>
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
          <DashboardHero />

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Usuarios"
              value={stats.totalUsers.toLocaleString()}
              icon={<Users className="w-5 h-5" />}
              trend={{ value: 12, label: 'vs mes pasado', direction: 'up' }}
              sparkline={[12, 14, 18, 15, 20, 24, 28, 30]}
              delay={0.1}
            />
            <MetricCard
              title="Interacciones"
              value={stats.totalInteractions.toLocaleString()}
              icon={<MessageSquare className="w-5 h-5" />}
              trend={{ value: 8, label: 'vs ayer', direction: 'up' }}
              sparkline={[30, 45, 40, 50, 60, 55, 70, 85]}
              delay={0.2}
            />
            <MetricCard
              title="Respuestas IA"
              value={stats.botResponses.toLocaleString()}
              icon={<Bot className="w-5 h-5" />}
              trend={{ value: 2, label: 'vs ayer', direction: 'down' }}
              sparkline={[60, 55, 58, 50, 48, 52, 49, 45]}
              delay={0.3}
            />
            <MetricCard
              title="Nuevos Hoy"
              value={stats.newUsersToday.toLocaleString()}
              icon={<UserPlus className="w-5 h-5" />}
              trend={{ value: 0, label: 'estable', direction: 'neutral' }}
              sparkline={[10, 10, 10, 10, 10, 10, 10, 10]}
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MainChart
              data={messagesData}
              selectedRange={selectedTimeRange}
              onRangeChange={handleRangeChange}
              showCustomRange={showCustomRange}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <div className="flex flex-col gap-6 h-full">
              <AIInsights />
              <ActivityTimeline />
            </div>
          </div>

          {/* Bottom Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canales */}
            <DashboardCard title="Estado de Canales" icon={<Box className="w-4 h-4" />}>
              <div className="space-y-3 mt-4">
                {platformData.map((platform) => {
                  const connection = connections.find(c => c.platform_type === platform.id);
                  const isConnected = connection?.status === 'connected';
                  const PlatformIcon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      onClick={() => navigate(platform.route)}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-white/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white dark:bg-[#242424] rounded-lg border border-slate-100 dark:border-white/5 ${platform.color}`}>
                          <PlatformIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{platform.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1">{isConnected ? 'Conectado' : 'Desconectado'}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </div>
                  );
                })}
              </div>
            </DashboardCard>

            {/* Quick Actions */}
            <DashboardCard title="Acciones Rápidas" icon={<Zap className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { name: 'Crear Bot', path: '/bot-builder' },
                  { name: 'Enviar Campaña', path: '/campaigns' },
                  { name: 'Crear Usuario', path: '/users' },
                  { name: 'Entrenar IA', path: '/ai-training' },
                  { name: 'Ver Reportes', path: '/analytics' },
                  { name: 'Configuración', path: '/settings' },
                ].map(action => (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-start p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{action.name}</span>
                  </button>
                ))}
              </div>
            </DashboardCard>

            {/* Plan Info */}
            <DashboardCard title="Plan y Consumo" icon={<CreditCard className="w-4 h-4" />}>
              <div className="mt-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Pro</h4>
                    <p className="text-sm font-medium text-slate-500">Plan actual</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">$49</h4>
                    <p className="text-sm font-medium text-slate-500">por mes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Interacciones</span>
                    <span>{stats.totalInteractions.toLocaleString()} / 10,000</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((stats.totalInteractions / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <button className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Administrar Facturación
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </DashboardCard>
          </div>

        </div>
      </PageBody>
    </PageContainer>
  );
};
