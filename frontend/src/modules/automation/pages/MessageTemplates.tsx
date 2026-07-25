import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Copy, MessageSquare, List, LayoutGrid, FileText } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { Dropdown } from '../../../components/ui/Dropdown';

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  createdAt: string;
}

const mockTemplates: MessageTemplate[] = [
  { id: 'TPL-001', name: 'Bienvenida', category: 'General', content: 'Hola {{nombre}}, gracias por contactarnos...', variables: ['nombre'], createdAt: '2024-01-10' },
  { id: 'TPL-002', name: 'Confirmación Pedido', category: 'Ventas', content: 'Tu pedido #{{orden}} ha sido confirmado...', variables: ['orden', 'total'], createdAt: '2024-01-08' },
  { id: 'TPL-003', name: 'Seguimiento', category: 'Soporte', content: '¿Cómo podemos ayudarte con tu caso #{{caso}}?', variables: ['caso'], createdAt: '2024-01-05' },
];

const CATEGORY_OPTIONS = ['General', 'Ventas', 'Soporte', 'Marketing'];

export const MessageTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'category', header: 'Categoría' },
    { key: 'content', header: 'Contenido', render: (value: string) => value.substring(0, 50) + '...' },
    { key: 'variables', header: 'Variables', render: (value: string[]) => value.join(', ') },
    { key: 'createdAt', header: 'Creado' },
    {
      key: 'actions', header: 'Acciones', className: 'text-center',
      render: () => (
        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Edit className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  const filtered = mockTemplates.filter(t =>
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || t.category === filterCategory)
  );

  return (
    <PageContainer>
      <PageHeader
        title="Plantillas de Mensajes"
        description="Respuestas rápidas para agentes humanos"
        icon={MessageSquare}
        action={
          <button className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95">
            <Plus className="w-4 h-4" />
            Nueva Plantilla
          </button>
        }
      />
      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                value={filterCategory}
                onChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  ...CATEGORY_OPTIONS.map(c => ({ value: c, label: c })),
                ]}
              />
              <div className="flex items-center dark:bg-dark-card rounded-xl p-1 border border-gray-200 dark:border-white/5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`} title="Vista de Tabla"><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`} title="Vista de Cuadrícula"><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <div key={t.id} className="group bg-slate-50 dark:bg-black/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500"><FileText className="w-5 h-5" /></div>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">{t.category}</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">{t.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{t.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">{t.createdAt}</span>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={filtered}
              columns={columns}
              pagination={{ currentPage, totalPages: Math.ceil(filtered.length / 10) || 1, onPageChange: setCurrentPage }}
            />
          )}
        </div>
      </PageBody>
    </PageContainer>
  );
};
