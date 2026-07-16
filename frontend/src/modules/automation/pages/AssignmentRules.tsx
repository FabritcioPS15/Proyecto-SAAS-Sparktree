import { useState } from 'react';
import { Plus, Search, Edit, Trash2, List, LayoutGrid, GitBranch } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface AssignmentRule {
  id: string; name: string; condition: string; assignTo: string; priority: number; status: 'active' | 'inactive';
}

const mockRules: AssignmentRule[] = [
  { id: 'RULE-001', name: 'VIP Customers', condition: 'total_purchases > 1000', assignTo: 'Agent Senior', priority: 1, status: 'active' },
  { id: 'RULE-002', name: 'New Customers', condition: 'first_interaction', assignTo: 'Agent Junior', priority: 2, status: 'active' },
  { id: 'RULE-003', name: 'Technical Issues', condition: 'category = technical', assignTo: 'Support Team', priority: 3, status: 'inactive' },
];

export const AssignmentRules = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formAction, setFormAction] = useState('');

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'condition', header: 'Condición' },
    { key: 'assignTo', header: 'Asignar a' },
    { key: 'priority', header: 'Prioridad' },
    { key: 'status', header: 'Estado', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'actions', header: 'Acciones', className: 'text-center', render: () => (
      <div className="flex gap-2">
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Edit className="w-4 h-4" /></button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  const filtered = mockRules.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || r.status === filterStatus)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Reglas de Asignación"
        description="Distribución de conversaciones entre agentes"
        action={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" /> Nueva Regla
          </button>
        }
      />
      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input type="text" placeholder="Buscar reglas..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                value={filterStatus}
                onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'active', label: 'Activo' },
                  { value: 'inactive', label: 'Inactivo' },
                ]}
              />
              <div className="flex items-center dark:bg-dark-card rounded-xl p-1 border border-gray-200 dark:border-white/5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((rule) => (
                <div key={rule.id} className="group bg-slate-50 dark:bg-black/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500"><GitBranch className="w-5 h-5" /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#{rule.priority}</span>
                    </div>
                    <StatusBadge status={rule.status} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">{rule.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">{rule.condition}</p>
                  <p className="text-xs text-slate-400 mb-3">→ {rule.assignTo}</p>
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable data={filtered} columns={columns}
              pagination={{ currentPage, totalPages: Math.ceil(filtered.length / 10) || 1, onPageChange: setCurrentPage }}
            />
          )}
        </div>
      </PageBody>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Regla"
        icon={<GitBranch className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); addNotification({ type: 'success', title: 'Regla creada', message: `Se ha creado la regla ${formName}` }); setShowCreateModal(false); }} className="space-y-4">
          <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nombre de la regla" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <Dropdown
            value={formCondition}
            onChange={v => setFormCondition(v)}
            placeholder="Seleccionar condición"
            options={[
              { value: 'total_purchases > 1000', label: 'Compras > 1000' },
              { value: 'first_interaction', label: 'Primera interacción' },
              { value: 'category = technical', label: 'Categoría técnica' },
            ]}
          />
          <Dropdown
            value={formAction}
            onChange={v => setFormAction(v)}
            placeholder="Seleccionar acción"
            options={[
              { value: 'Agent Senior', label: 'Asignar a Senior' },
              { value: 'Agent Junior', label: 'Asignar a Junior' },
              { value: 'Support Team', label: 'Asignar a Soporte' },
            ]}
          />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md">Crear Regla</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
