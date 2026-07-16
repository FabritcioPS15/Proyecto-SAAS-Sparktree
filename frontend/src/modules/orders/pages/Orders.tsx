import { useState } from 'react';
import { Plus, Search, Edit, Trash2, List, LayoutGrid, ShoppingCart } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface Order {
  id: string; customer: string; items: number; total: number;
  status: 'pending' | 'paid' | 'sent' | 'delivered' | 'cancelled';
  date: string; channel: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-001', customer: 'Juan Pérez', items: 3, total: 150.00, status: 'pending', date: '2024-01-15', channel: 'WhatsApp' },
  { id: 'ORD-002', customer: 'María García', items: 1, total: 75.00, status: 'paid', date: '2024-01-14', channel: 'Instagram' },
  { id: 'ORD-003', customer: 'Carlos López', items: 5, total: 320.00, status: 'sent', date: '2024-01-13', channel: 'WhatsApp' },
  { id: 'ORD-004', customer: 'Ana Martínez', items: 2, total: 120.00, status: 'delivered', date: '2024-01-12', channel: 'Messenger' },
  { id: 'ORD-005', customer: 'Pedro Sánchez', items: 4, total: 280.00, status: 'cancelled', date: '2024-01-11', channel: 'Telegram' },
];

const CHANNELS = ['WhatsApp', 'Instagram', 'Messenger', 'Telegram', 'TikTok'];

export const Orders = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns = [
    { key: 'id', header: 'Orden ID' },
    { key: 'customer', header: 'Cliente' },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total', render: (v: number) => `$${v.toFixed(2)}` },
    { key: 'status', header: 'Estado', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'date', header: 'Fecha' },
    { key: 'channel', header: 'Canal' },
  ];

  const filtered = mockOrders.filter(o =>
    (o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterChannel === 'all' || o.channel === filterChannel) &&
    (filterStatus === 'all' || o.status === filterStatus)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Pedidos"
        description="Gestiona las órdenes generadas desde el catálogo"
        action={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" /> Nuevo Pedido
          </button>
        }
      />
      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input type="text" placeholder="Buscar por cliente o ID..." value={searchTerm}
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
                  { value: 'pending', label: 'Pendiente' },
                  { value: 'paid', label: 'Pagado' },
                  { value: 'sent', label: 'Enviado' },
                  { value: 'delivered', label: 'Entregado' },
                  { value: 'cancelled', label: 'Cancelado' },
                ]}
              />
              <Dropdown
                value={filterChannel}
                onChange={(v) => { setFilterChannel(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los canales' },
                  ...CHANNELS.map(c => ({ value: c, label: c })),
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
              {filtered.map((order) => (
                <div key={order.id} className="group bg-slate-50 dark:bg-black/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500"><ShoppingCart className="w-5 h-5" /></div>
                    <StatusBadge status={order.status} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">{order.customer}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mb-2">{order.id}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">{order.items} items · {order.channel}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{order.date}</span>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
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
        title="Nuevo Pedido"
        icon={<ShoppingCart className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const product = (form.elements.namedItem('product') as HTMLInputElement).value; const amount = (form.elements.namedItem('amount') as HTMLInputElement).value; addNotification({ type: 'success', title: 'Pedido creado', message: `Se ha creado el pedido para ${name}` }); setShowCreateModal(false); }} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre del cliente" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="text" name="product" placeholder="Producto" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="number" name="amount" placeholder="Monto" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md">Crear Pedido</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
