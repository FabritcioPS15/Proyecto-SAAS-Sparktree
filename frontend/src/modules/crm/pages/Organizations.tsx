import { useState } from 'react';
import { Building2, Plus, Users, Crown, Clock, Edit2, Trash2, Info, Search } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { PageLoader } from '../../../components/layout/PageLoader';
import { DataTable } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';

const MOCK_ORGS = [
  { id: '1', name: 'Acme Corp', plan: 'enterprise', userCount: 150, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'TechFlow', plan: 'pro', userCount: 20, created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', name: 'Studio Creative', plan: 'free', userCount: 3, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', name: 'Global Logistics', plan: 'enterprise', userCount: 450, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', name: 'Fintech Solutions', plan: 'pro', userCount: 45, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', name: 'EduPlatform', plan: 'free', userCount: 5, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

type SortField = 'name' | 'plan' | 'usageTime';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export const Organizations = () => {
  const [orgs, setOrgs] = useState<any[]>(MOCK_ORGS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [showPlansInfo, setShowPlansInfo] = useState(false);
  const [formData, setFormData] = useState({ name: '', plan: 'free' });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const itemsPerPage = 10;

  const getOrgUsageTime = (org: any) => {
    if (!org.created_at) return { hours: 0, days: 0 };
    const createdDate = new Date(org.created_at);
    const now = new Date();
    const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
    return { hours: hoursDiff, days: Math.floor(hoursDiff / 24) };
  };

  const getOrgPlanColor = (plan: string) => {
    const safePlan = plan || 'free';
    switch (safePlan.toLowerCase()) {
      case 'free': return 'text-slate-500 border-slate-200';
      case 'pro': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';
      case 'enterprise': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50';
      default: return 'text-slate-500 border-slate-200';
    }
  };

  const getPlanDescription = (plan: string) => {
    const descriptions: { [key: string]: { title: string; desc: string; features: string[]; limit: string } } = {
      'free': {
        title: 'Starter',
        desc: 'Perfecto para pequeñas empresas que comienzan',
        features: ['Hasta 5 usuarios', '1,000 mensajes/mes', 'Soporte básico', '1 organización'],
        limit: 'Ideal para empezar'
      },
      'pro': {
        title: 'Growth',
        desc: 'Para empresas en crecimiento con mayores necesidades',
        features: ['Hasta 25 usuarios', '10,000 mensajes/mes', 'Soporte prioritario', '5 organizaciones', 'API básica'],
        limit: 'Popular para equipos'
      },
      'enterprise': {
        title: 'Global',
        desc: 'Solución completa para grandes corporaciones',
        features: ['Usuarios ilimitados', 'Mensajes ilimitados', 'Soporte 24/7', 'Organizaciones ilimitadas', 'API completa', 'SLA garantizado'],
        limit: 'Máxima capacidad'
      }
    };
    return descriptions[plan] || descriptions['free'];
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      plan: formData.plan,
      userCount: 1,
      created_at: new Date().toISOString()
    };
    setOrgs([...orgs, newOrg]);
    setIsModalOpen(false);
    setFormData({ name: '', plan: 'free' });
  };

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgs(orgs.map(org => org.id === editingOrg.id ? { ...org, name: formData.name, plan: formData.plan } : org));
    setEditingOrg(null);
    setFormData({ name: '', plan: 'free' });
    setIsModalOpen(false);
  };

  const handleDeleteOrg = (id: string) => {
    if (!window.confirm('¿Eliminar esta organización?')) return;
    setOrgs(orgs.filter(org => org.id !== id));
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredOrgs = orgs.filter(org => {
    const orgName = org.name || '';
    const orgPlan = org.plan || 'free';
    const matchesSearch = orgName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || orgPlan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const sortedOrgs = [...filteredOrgs].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = (a.name || '').localeCompare(b.name || '');
    } else if (sortField === 'plan') {
      comparison = (a.plan || '').localeCompare(b.plan || '');
    } else if (sortField === 'usageTime') {
      comparison = getOrgUsageTime(a).days - getOrgUsageTime(b).days;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const paginatedOrgs = sortedOrgs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedOrgs.length / itemsPerPage);

  const columns = [
    {
      key: 'name',
      header: 'Empresa',
      render: (_: any, org: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white capitalize">
              {org.name.toLowerCase()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (_: any, org: any) => {
        const planMap: Record<string, { variant: 'default' | 'success' | 'info' | 'primary' | 'danger' | 'warning'; label: string }> = {
          free: { variant: 'default', label: 'Free' },
          pro: { variant: 'success', label: 'Pro' },
          enterprise: { variant: 'info', label: 'Enterprise' },
        };
        const plan = (org.plan || 'free').toLowerCase();
        const cfg = planMap[plan] || planMap.free;
        return (
          <Badge variant={cfg.variant} size="xs" shape="rounded" icon={<Crown className="w-2.5 h-2.5" />}>
            {cfg.label}
          </Badge>
        );
      }
    },
    {
      key: 'users',
      header: 'Usuarios',
      render: (_: any, org: any) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Users className="w-3.5 h-3.5" />
          <span className="font-medium">{org.userCount || 0}</span>
        </div>
      )
    },
    {
      key: 'time',
      header: 'Tiempo',
      render: (_: any, org: any) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">{getOrgUsageTime(org).days}d</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_: any, org: any) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => {
              setEditingOrg(org);
              setFormData({ name: org.name, plan: org.plan });
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteOrg(org.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  if (loading) return <PageLoader sectionName="Organizaciones" />;

  return (
    <PageContainer>
      <PageHeader
        title="Gestión de"
        highlight="Empresas"
        description="Administra el ecosistema de tenantes."
        icon={Building2}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPlansInfo(true)}
              className="p-2.5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all border border-slate-200 dark:border-slate-700"
              title="Información de Planes"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>
        }
      />

      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar empresas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm cursor-pointer min-w-[160px]"
              >
                <option value="all">Todos los planes</option>
                <option value="free">Starter</option>
                <option value="pro">Growth</option>
                <option value="enterprise">Global</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedOrgs}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        </div>
      </PageBody>

      {/* Modal Reusable Structure */}
      {(isModalOpen || editingOrg) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f1115] w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

            <div className="p-8 relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-accent-500/10 rounded-2xl text-accent-500 shadow-lg shadow-accent-500/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingOrg ? 'Editar Empresa' : 'Nueva Empresa'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {editingOrg ? 'Modifica los datos de la organizaciÃ³n' : 'Registra una nueva empresa en el sistema'}
                  </p>
                </div>
              </div>

              <form onSubmit={editingOrg ? handleUpdateOrg : handleCreateOrg} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Comercial</label>
                  <div className="relative">
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60"
                      placeholder="Ej. SparkBot Corporation"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'free', label: 'Starter', desc: 'BÃ¡sico', color: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' },
                      { value: 'pro', label: 'Growth', desc: 'Profesional', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                      { value: 'enterprise', label: 'Global', desc: 'Empresarial', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' }
                    ].map((plan) => (
                      <button
                        key={plan.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, plan: plan.value })}
                        className={`relative p-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${formData.plan === plan.value
                          ? `${plan.color} border-accent-500 shadow-lg shadow-accent-500/20`
                          : `${plan.color} border-transparent hover:border-accent-500/30`
                          }`}
                      >
                        <div className="font-black">{plan.label}</div>
                        <div className="text-[8px] opacity-60 mt-0.5">{plan.desc}</div>
                        {formData.plan === plan.value && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingOrg(null); setFormData({ name: '', plan: 'free' }); }}
                    className="flex-1 py-3.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700 transition-colors rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25"
                  >
                    {editingOrg ? 'Actualizar Empresa' : 'Crear Empresa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Plans Info Modal */}
      {showPlansInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f1115] w-full max-w-lg rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl rounded-full -mr-12 -mt-12" />

            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500 shadow-lg shadow-accent-500/10">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Planes Disponibles
                  </h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    CaracterÃ­sticas por nivel
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  {
                    key: 'free',
                    title: 'Starter',
                    desc: 'Perfecto para empezar',
                    features: ['5 usuarios', '1K mensajes', 'Soporte bÃ¡sico'],
                    color: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
                    accent: 'text-slate-500',
                    badge: 'bg-slate-500'
                  },
                  {
                    key: 'pro',
                    title: 'Growth',
                    desc: 'Ideal para equipos',
                    features: ['25 usuarios', '10K mensajes', 'Soporte prioritario'],
                    color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                    accent: 'text-emerald-500',
                    badge: 'bg-emerald-500'
                  },
                  {
                    key: 'enterprise',
                    title: 'Global',
                    desc: 'MÃ¡xima capacidad',
                    features: ['Usuarios âˆž', 'Mensajes âˆž', 'Soporte 24/7'],
                    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                    accent: 'text-purple-500',
                    badge: 'bg-purple-500'
                  }
                ].map((planInfo) => (
                  <div key={planInfo.key} className={`rounded-xl p-4 border ${planInfo.color} relative overflow-hidden`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-1.5 rounded-lg text-white text-[10px] font-black uppercase tracking-widest ${planInfo.badge}`}>
                        {planInfo.title.slice(0, 3)}
                      </div>
                      <div className={`text-[9px] font-black uppercase tracking-widest ${planInfo.accent}`}>
                        {planInfo.desc}
                      </div>
                    </div>
                    <h4 className={`text-base font-black mb-2 ${planInfo.key === 'free' ? 'text-slate-900' :
                      planInfo.key === 'pro' ? 'text-emerald-900' :
                        'text-purple-900'
                      }`}>
                      {planInfo.title}
                    </h4>
                    <div className="space-y-1">
                      {planInfo.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full ${planInfo.key === 'free' ? 'bg-slate-400' :
                            planInfo.key === 'pro' ? 'bg-emerald-400' :
                              'bg-purple-400'
                            }`} />
                          <span className="text-[10px] text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowPlansInfo(false)}
                  className="w-full py-3 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};


