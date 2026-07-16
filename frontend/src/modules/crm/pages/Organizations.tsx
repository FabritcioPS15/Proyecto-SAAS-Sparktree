import { useState } from 'react';
import { Building2, Plus, Users, Crown, Clock, Edit, Trash2, Info, Search } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { ViewToggle, ViewMode } from '../../../components/ui/ViewToggle';
import { TableCard } from '../../../components/ui/TableCard';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { TableActions } from '../../../components/ui/TableActions';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

const MOCK_ORGS = [
  { id: '1', name: 'Acme Corp', plan: 'enterprise', userCount: 150, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'TechFlow', plan: 'pro', userCount: 20, created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', name: 'Studio Creative', plan: 'free', userCount: 3, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', name: 'Global Logistics', plan: 'enterprise', userCount: 450, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', name: 'Fintech Solutions', plan: 'pro', userCount: 45, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', name: 'EduPlatform', plan: 'free', userCount: 5, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];


export const Organizations = () => {
  const { addNotification } = useNotifications();
  const [orgs, setOrgs] = useState<any[]>(MOCK_ORGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [showPlansInfo, setShowPlansInfo] = useState(false);
  const [formData, setFormData] = useState({ name: '', plan: 'free' });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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
    addNotification({ type: 'success', title: 'Empresa creada', message: `${newOrg.name} ha sido registrada exitosamente.` });
  };

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgs(orgs.map(org => org.id === editingOrg.id ? { ...org, name: formData.name, plan: formData.plan } : org));
    setEditingOrg(null);
    setFormData({ name: '', plan: 'free' });
    setIsModalOpen(false);
    addNotification({ type: 'success', title: 'Empresa actualizada', message: `Los datos de ${formData.name} han sido modificados.` });
  };

  const handleDeleteOrg = () => {
    if (!deleteTarget) return;
    const deletedName = orgs.find(o => o.id === deleteTarget)?.name;
    setOrgs(orgs.filter(org => org.id !== deleteTarget));
    setDeleteTarget(null);
    if (deletedName) addNotification({ type: 'success', title: 'Empresa eliminada', message: `${deletedName} ha sido eliminada del sistema.` });
  };

  const filteredOrgs = orgs.filter(org => {
    const orgName = org.name || '';
    const orgPlan = org.plan || 'free';
    const matchesSearch = orgName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || orgPlan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const sortedOrgs = [...filteredOrgs].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

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
            <div className="font-bold text-slate-900 dark:text-white capitalize">{org.name.toLowerCase()}</div>
          </div>
        </div>
      )
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (_: any, org: any) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getOrgPlanColor(org.plan)}`}>
          <Crown className="w-2.5 h-2.5" />
          {org.plan}
        </span>
      )
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
      className: 'text-center',
      render: (_: any, org: any) => (
        <TableActions
          actions={[
            { icon: <Edit className="w-4 h-4" />, label: 'Editar', onClick: () => { setEditingOrg(org); setFormData({ name: org.name, plan: org.plan }); setIsModalOpen(true); }, tooltip: 'Editar Empresa' },
            { icon: <Trash2 className="w-4 h-4" />, label: 'Eliminar', onClick: () => setDeleteTarget(org.id), variant: 'danger', tooltip: 'Eliminar Empresa' },
          ]}
        />
      )
    }
  ];

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
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>
        }
      />

      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar empresas por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={planFilter}
                onChange={setPlanFilter}
                options={[
                  { value: 'all', label: 'Todos los planes' },
                  { value: 'free', label: 'Starter' },
                  { value: 'pro', label: 'Growth' },
                  { value: 'enterprise', label: 'Global' },
                ]}
              />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedOrgs}
            pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
          />
        </TableCard>
      </PageBody>

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen || !!editingOrg}
        onClose={() => { setIsModalOpen(false); setEditingOrg(null); setFormData({ name: '', plan: 'free' }); }}
        title={editingOrg ? 'Editar Empresa' : 'Nueva Empresa'}
        icon={<Building2 className="w-5 h-5 text-accent-500" />}
        size="sm"
      >
        <form onSubmit={editingOrg ? handleUpdateOrg : handleCreateOrg} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Comercial</label>
            <div className="relative">
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3.5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" placeholder="Ej. Sparktree Corporation" />
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
                <button key={plan.value} type="button" onClick={() => setFormData({ ...formData, plan: plan.value })}
                  className={`relative p-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${formData.plan === plan.value ? `${plan.color} border-accent-500 shadow-lg shadow-accent-500/20` : `${plan.color} border-transparent hover:border-accent-500/30`}`}>
                  <div className="font-black">{plan.label}</div>
                  <div className="text-[8px] opacity-60 mt-0.5">{plan.desc}</div>
                  {formData.plan === plan.value && <div className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingOrg(null); setFormData({ name: '', plan: 'free' }); }}
              className="flex-1 py-3.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700 transition-colors rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-3.5 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25">
              {editingOrg ? 'Actualizar Empresa' : 'Crear Empresa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Plans Info Modal */}
      <Modal
        open={showPlansInfo}
        onClose={() => setShowPlansInfo(false)}
        title="Planes Disponibles"
        icon={<Info className="w-5 h-5 text-accent-500" />}
        size="md"
      >
        <div className="space-y-3 mb-6">
          {[
            { key: 'free', title: 'Starter', desc: 'Perfecto para empezar', features: ['5 usuarios', '1K mensajes', 'Soporte básico'], color: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700', accent: 'text-slate-500', badge: 'bg-slate-500' },
            { key: 'pro', title: 'Growth', desc: 'Ideal para equipos', features: ['25 usuarios', '10K mensajes', 'Soporte prioritario'], color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', accent: 'text-emerald-500', badge: 'bg-emerald-500' },
            { key: 'enterprise', title: 'Global', desc: 'Máxima capacidad', features: ['Usuarios ∞', 'Mensajes ∞', 'Soporte 24/7'], color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', accent: 'text-purple-500', badge: 'bg-purple-500' }
          ].map((planInfo) => (
            <div key={planInfo.key} className={`rounded-xl p-4 border ${planInfo.color} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-1.5 rounded-lg text-white text-[10px] font-black uppercase tracking-widest ${planInfo.badge}`}>{planInfo.title.slice(0, 3)}</div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${planInfo.accent}`}>{planInfo.desc}</div>
              </div>
              <h4 className={`text-base font-black mb-2 ${planInfo.key === 'free' ? 'text-slate-900' : planInfo.key === 'pro' ? 'text-emerald-900' : 'text-purple-900'}`}>{planInfo.title}</h4>
              <div className="space-y-1">
                {planInfo.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${planInfo.key === 'free' ? 'bg-slate-400' : planInfo.key === 'pro' ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setShowPlansInfo(false)} className="w-full py-3 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25">
            Entendido
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOrg}
        title="Eliminar Organización"
        message="¿Eliminar esta organización? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </PageContainer>
  );
};
