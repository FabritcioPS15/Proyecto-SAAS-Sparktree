import { useState } from 'react';
import { Plus, Edit, Trash2, Webhook, Copy } from 'lucide-react';
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

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered: string;
}

const mockWebhooks: WebhookItem[] = [
  { id: 'WH-001', name: 'ERP Integration', url: 'https://erp.example.com/webhook', events: ['order.created', 'order.updated'], status: 'active', lastTriggered: '2024-01-15 10:30' },
  { id: 'WH-002', name: 'Billing System', url: 'https://billing.example.com/api', events: ['payment.completed'], status: 'active', lastTriggered: '2024-01-14 15:45' },
  { id: 'WH-003', name: 'Analytics', url: 'https://analytics.example.com/track', events: ['*'], status: 'inactive', lastTriggered: '2024-01-10 09:00' },
];

export const Webhooks = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'url', header: 'URL', render: (value: string) => <span className="truncate max-w-xs block text-xs font-mono">{value}</span> },
    { key: 'events', header: 'Eventos', render: (value: string[]) => value.join(', ') },
    { key: 'status', header: 'Estado', render: (value: string) => <StatusBadge status={value} /> },
    { key: 'lastTriggered', header: 'Último Disparo' },
    {
      key: 'actions', header: 'Acciones', className: 'text-center',
      render: (_: any, row: WebhookItem) => (
        <TableActions
          actions={[
            { icon: <Edit className="w-4 h-4" />, label: 'Editar', onClick: (e) => e.stopPropagation(), tooltip: 'Editar Webhook' },
            { icon: <Copy className="w-4 h-4" />, label: 'Duplicar', onClick: (e) => e.stopPropagation(), tooltip: 'Duplicar Webhook' },
            { icon: <Trash2 className="w-4 h-4" />, label: 'Eliminar', onClick: () => setDeleteTarget(row.id), variant: 'danger', tooltip: 'Eliminar Webhook' },
          ]}
        />
      )
    },
  ];

  const filtered = mockWebhooks.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || w.status === filterStatus)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Webhooks / API"
        description="Integraciones externas (facturación, ERP)"
        icon={Webhook}
        action={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95">
            <Plus className="w-4 h-4" />
            Nuevo Webhook
          </button>
        }
      />
      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar webhooks..."
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
              {filtered.map((wh) => (
                <GridCard
                  key={wh.id}
                  icon={<Webhook className="w-5 h-5" />}
                  title={wh.name}
                  subtitle={wh.url}
                  status={<StatusBadge status={wh.status} />}
                  actions={
                    <>
                      <span className="text-[10px] text-slate-400">Último: {wh.lastTriggered}</span>
                      <TableActions
                        actions={[
                          { icon: <Edit className="w-3.5 h-3.5" />, label: 'Editar', onClick: (e) => e.stopPropagation(), tooltip: 'Editar' },
                          { icon: <Trash2 className="w-3.5 h-3.5" />, label: 'Eliminar', onClick: () => setDeleteTarget(wh.id), variant: 'danger', tooltip: 'Eliminar' },
                        ]}
                      />
                    </>
                  }
                >
                  <p className="text-[10px] text-slate-400">{wh.events.join(', ')}</p>
                </GridCard>
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
        title="Eliminar Webhook"
        message="¿Estás seguro de eliminar este webhook?"
        confirmText="Eliminar"
        variant="danger"
      />
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Webhook"
        icon={<Webhook className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const url = (form.elements.namedItem('url') as HTMLInputElement).value; const events = (form.elements.namedItem('events') as HTMLInputElement).value; addNotification({ type: 'success', title: 'Webhook creado', message: `Se ha creado el webhook ${name}` }); setShowCreateModal(false); }} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre del webhook" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="url" name="url" placeholder="URL del webhook" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="text" name="events" placeholder="Eventos (separados por coma)" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-md">Crear Webhook</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
