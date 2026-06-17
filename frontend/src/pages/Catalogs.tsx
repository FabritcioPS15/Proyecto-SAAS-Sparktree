import { useState } from 'react';
import { Store, Plus, Search, Filter, Image, Video, FileText, ChevronRight, Package, Tag, Save, X, Edit2, Trash2 } from 'lucide-react';
import { PageLoader } from '../components/layout/PageLoader';

// MOCK DATA
const MOCK_CATALOGS = [
  {
    id: '1',
    name: 'Colección Verano 2026',
    description: 'Catálogo principal de la nueva temporada',
    status: 'active',
    items: [
      { id: '101', title: 'Camiseta Básica', price: '$25.00', type: 'image' },
      { id: '102', title: 'Short Playa', price: '$35.00', type: 'video' },
    ]
  },
  {
    id: '2',
    name: 'Accesorios',
    description: 'Relojes, collares y más',
    status: 'draft',
    items: [
      { id: '201', title: 'Reloj Deportivo', price: '$85.00', type: 'image' }
    ]
  }
];

export const Catalogs = () => {
  const [catalogs, setCatalogs] = useState(MOCK_CATALOGS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any>(null);

  if (loading) return <PageLoader sectionName="Catálogos" />;

  const handleCreate = () => {
    setEditingCatalog(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (catalog: any) => {
    setEditingCatalog(catalog);
    setIsEditorOpen(true);
  };

  return (
    <div className="h-full animate-in fade-in duration-500 flex flex-col relative overflow-hidden bg-[#f7f9fc] dark:bg-[#0b0c10]">
      {/* Header */}
      <div className="px-8 py-6 bg-white dark:bg-[#11141b] border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-500/10 rounded-2xl flex items-center justify-center">
            <Store className="w-6 h-6 text-accent-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Catálogos</h1>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Gestiona productos e inventario</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="bg-accent-500 hover:bg-accent-600 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-accent-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Catálogo
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-accent-500/50 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar catálogos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 dark:text-white w-full placeholder:text-gray-400"
            />
          </div>
          <button className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map(catalog => (
            <div key={catalog.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-[#11141b] rounded-2xl flex items-center justify-center shadow-inner">
                  <Package className="w-6 h-6 text-accent-500" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${catalog.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-100 dark:bg-white/10 text-gray-500 border-transparent'}`}>
                  {catalog.status === 'active' ? 'Activo' : 'Borrador'}
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">{catalog.name}</h3>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{catalog.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{catalog.items.length} items</span>
                </div>
                <button onClick={() => handleEdit(catalog)} className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-[#11141b] flex items-center justify-center text-gray-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-over Editor */}
      {isEditorOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditorOpen(false)} />
          <div className="w-full max-w-2xl bg-white dark:bg-[#0b0c10] shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-gray-100 dark:border-white/5">
            {/* Editor Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#11141b]">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{editingCatalog ? 'Editar Catálogo' : 'Nuevo Catálogo'}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configura los detalles e items</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsEditorOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
                <button className="bg-accent-500 hover:bg-accent-600 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Nombre del Catálogo</label>
                  <input type="text" placeholder="Ej. Promociones Verano" defaultValue={editingCatalog?.name} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#11141b] rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Descripción</label>
                  <textarea rows={3} placeholder="Describe el contenido del catálogo..." defaultValue={editingCatalog?.description} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#11141b] rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors resize-none" />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Items / Products */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Productos / Items</h3>
                  <button className="text-[10px] font-black text-accent-500 uppercase tracking-widest hover:text-accent-600 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Añadir Item
                  </button>
                </div>

                <div className="space-y-4">
                  {editingCatalog?.items?.map((item: any) => (
                    <div key={item.id} className="p-4 bg-white dark:bg-[#11141b] border border-gray-100 dark:border-white/5 rounded-2xl flex items-start gap-4 group hover:border-accent-500/50 transition-colors shadow-sm">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-gray-100 dark:border-white/5">
                        {item.type === 'video' ? <Video className="w-6 h-6 text-gray-300" /> : <Image className="w-6 h-6 text-gray-300" />}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Cambiar</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <input type="text" defaultValue={item.title} placeholder="Nombre del producto" className="w-full bg-transparent text-sm font-black text-gray-900 dark:text-white outline-none placeholder:text-gray-400" />
                        <div className="flex gap-2">
                          <input type="text" defaultValue={item.price} placeholder="Precio ($0.00)" className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-[#0b0c10] rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors" />
                          <input type="text" placeholder="Enlace/URL (opcional)" className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-[#0b0c10] rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors" />
                        </div>
                        <textarea rows={2} placeholder="Descripción breve..." className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0b0c10] rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors resize-none" />
                      </div>
                      <button className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(!editingCatalog?.items || editingCatalog.items.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400">Este catálogo está vacío.</p>
                      <button className="mt-3 text-[10px] font-black text-accent-500 uppercase tracking-widest hover:underline">
                        Agrega tu primer producto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogs;
