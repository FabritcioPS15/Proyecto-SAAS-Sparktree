import { useState } from 'react';
import { Plus, Search, Copy, Trash2, List, LayoutGrid, Tag } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface Promotion {
  id: string; code: string; discount: number; type: 'percentage' | 'fixed';
  minPurchase: number; usageLimit: number; used: number;
  status: 'active' | 'inactive'; expiresAt: string;
}

const mockPromotions: Promotion[] = [
  { id: 'PROM-001', code: 'VERANO20', discount: 20, type: 'percentage', minPurchase: 100, usageLimit: 100, used: 45, status: 'active', expiresAt: '2024-03-31' },
  { id: 'PROM-002', code: 'FIESTA10', discount: 10, type: 'fixed', minPurchase: 50, usageLimit: 50, used: 50, status: 'inactive', expiresAt: '2024-02-28' },
  { id: 'PROM-003', code: 'NUEVO15', discount: 15, type: 'percentage', minPurchase: 75, usageLimit: 200, used: 12, status: 'active', expiresAt: '2024-04-30' },
];

export const Promotions = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExpiresAt, setNewExpiresAt] = useState<dayjs.Dayjs | null>(null);

  const columns = [
    { key: 'code', header: 'Código' },
    { key: 'discount', header: 'Descuento', render: (v: number, row: Promotion) => `${v}${row.type === 'percentage' ? '%' : '$'}` },
    { key: 'minPurchase', header: 'Compra Mín.', render: (v: number) => `$${v}` },
    { key: 'usage', header: 'Uso', render: (_v: unknown, row: Promotion) => `${row.used}/${row.usageLimit}` },
    { key: 'status', header: 'Estado', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'expiresAt', header: 'Expira' },
    { key: 'actions', header: 'Acciones', className: 'text-center', render: () => (
      <div className="flex gap-2">
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Copy className="w-4 h-4" /></button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  const filtered = mockPromotions.filter(p =>
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || p.status === filterStatus)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Promociones"
        description="Gestiona cupones y descuentos vinculados al catálogo"
        action={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95">
            <Plus className="w-4 h-4" /> Nueva Promoción
          </button>
        }
      />
      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input type="text" placeholder="Buscar por código..." value={searchTerm}
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
              {filtered.map((promo) => (
                <div key={promo.id} className="group bg-slate-50 dark:bg-black/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500"><Tag className="w-5 h-5" /></div>
                    <StatusBadge status={promo.status} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1 tracking-widest font-mono">{promo.code}</h3>
                  <p className="text-2xl font-black text-accent-500 mb-3">
                    {promo.discount}{promo.type === 'percentage' ? '%' : '$'} <span className="text-xs font-normal text-slate-400">descuento</span>
                  </p>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Compra mín.</span>
                      <span className="font-bold text-slate-900 dark:text-white">${promo.minPurchase}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Usos</span>
                      <span className="font-bold text-slate-900 dark:text-white">{promo.used}/{promo.usageLimit}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Expira</span>
                      <span className="font-bold text-slate-900 dark:text-white">{promo.expiresAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Copy className="w-3.5 h-3.5" /></button>
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
        title="Nueva Promoción"
        icon={<Tag className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const discount = (form.elements.namedItem('discount') as HTMLInputElement).value; const expiresAt = newExpiresAt?.format('YYYY-MM-DD') || ''; addNotification({ type: 'success', title: 'Promoción creada', message: `Se ha creado la promoción ${name}` }); setShowCreateModal(false); }} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre de la promoción" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="number" name="discount" placeholder="Porcentaje de descuento" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <DatePicker
            value={newExpiresAt}
            onChange={(v) => setNewExpiresAt(v)}
            slotProps={{ textField: { size: 'small', required: true } }}
            sx={{
              width: '100%',
              '& .MuiInputBase-root': { borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #e2e8f0' }
            }}
          />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-md">Crear Promoción</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
