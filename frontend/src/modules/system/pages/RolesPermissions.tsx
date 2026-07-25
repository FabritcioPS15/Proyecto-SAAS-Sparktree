import { useState } from 'react';
import { Plus, Edit, Trash2, ShieldCheck, Copy } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { ViewToggle, ViewMode } from '../../../components/ui/ViewToggle';
import { TableCard } from '../../../components/ui/TableCard';
import { GridCard } from '../../../components/ui/GridCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { TableActions } from '../../../components/ui/TableActions';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users: number;
  status: 'active' | 'inactive';
}

const mockRoles: Role[] = [
  { id: 'ROLE-001', name: 'Administrador', description: 'Acceso completo al sistema', permissions: ['all'], users: 2, status: 'active' },
  { id: 'ROLE-002', name: 'Agente', description: 'Acceso a conversaciones y clientes', permissions: ['conversations.read', 'clients.read'], users: 5, status: 'active' },
  { id: 'ROLE-003', name: 'Supervisor', description: 'Acceso a reportes y gestión de equipo', permissions: ['reports.read', 'team.manage'], users: 1, status: 'active' },
];

export const RolesPermissions = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción' },
    { key: 'permissions', header: 'Permisos', render: (value: string[]) => value.length > 3 ? `${value.slice(0, 3).join(', ')}...` : value.join(', ') },
    { key: 'users', header: 'Usuarios' },
    { key: 'status', header: 'Estado', render: (value: string) => <StatusBadge status={value} /> },
    {
      key: 'actions', header: 'Acciones', className: 'text-center',
      render: (_: any, row: Role) => (
        <TableActions
          actions={[
            { icon: <Edit className="w-4 h-4" />, label: 'Editar', onClick: (e) => e.stopPropagation(), tooltip: 'Editar Rol' },
            { icon: <Copy className="w-4 h-4" />, label: 'Duplicar', onClick: (e) => e.stopPropagation(), tooltip: 'Duplicar Rol' },
            { icon: <Trash2 className="w-4 h-4" />, label: 'Eliminar', onClick: () => setDeleteTarget(row.id), variant: 'danger', tooltip: 'Eliminar Rol' },
          ]}
        />
      )
    },
  ];

  const filtered = mockRoles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || r.status === filterStatus)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Roles y Permisos"
        description="Granularidad de permisos dentro del equipo"
        action={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95">
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </button>
        }
      />
      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={filterStatus}
                onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'active', label: 'Activo' },
                  { value: 'inactive', label: 'Inactivo' },
                ]}
              />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((role) => (
                <GridCard
                  key={role.id}
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title={role.name}
                  subtitle={role.description}
                  status={<StatusBadge status={role.status} />}
                  actions={
                    <>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{role.users} usuarios</span>
                      <TableActions
                        actions={[
                          { icon: <Edit className="w-3.5 h-3.5" />, label: 'Editar', onClick: (e) => e.stopPropagation(), tooltip: 'Editar' },
                          { icon: <Trash2 className="w-3.5 h-3.5" />, label: 'Eliminar', onClick: () => setDeleteTarget(role.id), variant: 'danger', tooltip: 'Eliminar' },
                        ]}
                      />
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <DataTable
              data={filtered}
              columns={columns}
              pagination={{ currentPage, totalPages: Math.ceil(filtered.length / 10) || 1, onPageChange: setCurrentPage }}
            />
          )}
        </TableCard>
      </PageBody>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        title="Eliminar Rol"
        message="¿Estás seguro de eliminar este rol?"
        confirmText="Eliminar"
        variant="danger"
      />
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Rol"
        icon={<ShieldCheck className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const description = (form.elements.namedItem('description') as HTMLInputElement).value; addNotification({ type: 'success', title: 'Rol creado', message: `Se ha creado el rol ${name}` }); setShowCreateModal(false); }} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre del rol" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="text" name="description" placeholder="Descripción" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-md">Crear Rol</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
