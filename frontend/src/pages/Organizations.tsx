import { useState, useEffect } from 'react';
import { Building2, Plus, Users, Crown, Clock, Edit2, Trash2, List, LayoutGrid, ArrowUpDown, Info } from 'lucide-react';
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

type SortField = 'name' | 'plan' | 'usageTime';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export const Organizations = () => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [showPlansInfo, setShowPlansInfo] = useState(false);
  const [formData, setFormData] = useState({ name: '', plan: 'free' });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const getOrgUsageTime = (org: any) => {
    if (!org.created_at) return { hours: 0, days: 0 };
    const createdDate = new Date(org.created_at);
    const now = new Date();
    const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
    return { hours: hoursDiff, days: Math.floor(hoursDiff / 24) };
  };

  const getOrgPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free': return 'text-slate-500 bg-slate-50 border-slate-200';
      case 'pro': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';
      case 'enterprise': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
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

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const data = await getOrganizations();
      setOrgs(data);
    } catch (err) {
      console.error('Error fetching orgs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrganization(formData);
      setIsModalOpen(false);
      setFormData({ name: '', plan: 'free' });
      fetchOrgs();
    } catch (err) {
      console.error('Error creating org:', err);
      alert('Error al crear la organización');
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrganization(editingOrg.id, formData);
      setEditingOrg(null);
      setFormData({ name: '', plan: 'free' });
      setIsModalOpen(false);
      fetchOrgs();
    } catch (err) {
      console.error('Error updating org:', err);
      alert('Error al actualizar la organización');
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!window.confirm('¿Eliminar esta organización?')) return;
    try {
      await deleteOrganization(id);
      fetchOrgs();
    } catch (err) {
      console.error('Error deleting org:', err);
      alert('Error al eliminar la organización');
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-xl p-0 border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowPlansInfo(true)}
              className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all border border-slate-200 dark:border-slate-700"
              title="Información de Planes"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 h-10 bg-black dark:bg-accent-500 text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>
        }
      />

      <PageBody>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orgs.map((org) => (
              <div key={org.id} className="group bg-white dark:bg-[#11141b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-accent-500/10 transition-colors" />

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-accent-500 transition-all duration-500 group-hover:scale-110 shadow-inner">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize truncate pr-2 leading-tight">
                        {org.name.toLowerCase()}
                      </h3>
                      <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getOrgPlanColor(org.plan)} shadow-sm`}>
                        <Crown className="w-3 h-3" />
                        {org.plan}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-1 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/50 dark:bg-white/2 p-3 rounded-2xl border border-slate-100/50 dark:border-white/5 group-hover:border-accent-500/20 transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuarios</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent-500" />
                        <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                          {org.userCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-white/2 p-3 rounded-2xl border border-slate-100/50 dark:border-white/5 group-hover:border-accent-500/20 transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Actividad</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                          {getOrgUsageTime(org).days}<small className="text-xs opacity-50 ml-0.5">d</small>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingOrg(org);
                        setFormData({ name: org.name, plan: org.plan });
                        setIsModalOpen(true);
                      }}
                      className="flex-1 h-10 bg-slate-900 dark:bg-white/5 text-white dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-accent-500 dark:hover:text-black transition-all shadow-sm active:scale-95"
                    >
                      Configurar
                    </button>
                    <button
                      onClick={() => handleDeleteOrg(org.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#11141b] rounded-xl border border-slate-100 dark:border-slate-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">Empresa <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-pointer" onClick={() => handleSort('plan')}>
                      <div className="flex items-center gap-2">Plan <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px]">Usuarios</th>
                    <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-pointer" onClick={() => handleSort('usageTime')}>
                      <div className="flex items-center gap-2">Tiempo <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {orgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-all">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{org.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getOrgPlanColor(org.plan)}`}>
                          <Crown className="w-2.5 h-2.5" />
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Users className="w-3.5 h-3.5" />
                          <span className="font-medium">{org.userCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">{getOrgUsageTime(org).days}d</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                    {editingOrg ? 'Modifica los datos de la organización' : 'Registra una nueva empresa en el sistema'}
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
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60"
                      placeholder="Ej. Sparktree Corporation"
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
                      { value: 'free', label: 'Starter', desc: 'Básico', color: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' },
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
                    Características por nivel
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  {
                    key: 'free',
                    title: 'Starter',
                    desc: 'Perfecto para empezar',
                    features: ['5 usuarios', '1K mensajes', 'Soporte básico'],
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
                    desc: 'Máxima capacidad',
                    features: ['Usuarios ∞', 'Mensajes ∞', 'Soporte 24/7'],
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
