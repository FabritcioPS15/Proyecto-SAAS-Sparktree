import { useState, useEffect } from 'react';
import { Store, Plus, Search, Filter, Image as ImageIcon, Video, Package, Tag, Save, X, Edit2, Trash2, Upload } from 'lucide-react';
import { PageLoader } from '../../../components/layout/PageLoader';
import { getCatalogs, createCatalog, updateCatalog, deleteCatalog, uploadProductMedia } from '../../../services/api';

export const Catalogs = () => {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const data = await getCatalogs();
      setCatalogs(data);
    } catch (error) {
      console.error('Failed to fetch catalogs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCatalog({
      name: '',
      description: '',
      status: 'draft',
      items: []
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (catalog: any) => {
    // deep clone so we don't edit original until save
    setEditingCatalog(JSON.parse(JSON.stringify(catalog)));
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!editingCatalog) return;
    try {
      setLoading(true);
      if (editingCatalog.id) {
        await updateCatalog(editingCatalog.id, editingCatalog);
      } else {
        await createCatalog(editingCatalog);
      }
      setIsEditorOpen(false);
      await fetchCatalogs();
    } catch (error) {
      console.error('Failed to save catalog', error);
      alert('Error al guardar el catÃ¡logo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (catalogId: string) => {
    if (window.confirm('Â¿EstÃ¡s seguro de eliminar este catÃ¡logo?')) {
      try {
        setLoading(true);
        await deleteCatalog(catalogId);
        await fetchCatalogs();
      } catch (error) {
        console.error('Failed to delete catalog', error);
        alert('Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddItem = () => {
    if (!editingCatalog) return;
    setEditingCatalog({
      ...editingCatalog,
      items: [
        ...(editingCatalog.items || []),
        { id: Date.now().toString(), title: '', price: '', type: 'image', url: '', description: '', media_url: '' }
      ]
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!editingCatalog) return;
    setEditingCatalog({
      ...editingCatalog,
      items: editingCatalog.items.filter((item: any) => item.id !== itemId)
    });
  };

  const handleItemChange = (itemId: string, field: string, value: string) => {
    if (!editingCatalog) return;
    setEditingCatalog({
      ...editingCatalog,
      items: editingCatalog.items.map((item: any) => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const handleImageUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(itemId);
      const url = await uploadProductMedia(file);
      handleItemChange(itemId, 'media_url', url as string);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Error al subir la imagen. Verifica el tamaÃ±o (mÃ¡x 10MB) o el almacenamiento.');
    } finally {
      setUploadingImage(null);
    }
  };

  if (loading && catalogs.length === 0) return <PageLoader sectionName="CatÃ¡logos" />;

  const filteredCatalogs = catalogs.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full animate-in fade-in duration-500 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-500/10 rounded-2xl flex items-center justify-center">
            <Store className="w-6 h-6 text-accent-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">CatÃ¡logos</h1>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Gestiona productos e inventario</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="bg-accent-500 hover:bg-accent-600 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-accent-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear CatÃ¡logo
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-accent-500/50 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar catÃ¡logos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 dark:text-white w-full placeholder:text-gray-400"
            />
          </div>
          <button className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalogs.map(catalog => (
            <div key={catalog.id} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 dark:bg-dark-card rounded-2xl flex items-center justify-center shadow-inner">
                  <Package className="w-6 h-6 text-accent-500" />
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${catalog.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-100 dark:bg-dark-card text-gray-500 border-transparent'}`}>
                    {catalog.status === 'active' ? 'Activo' : 'Borrador'}
                  </div>
                  <button onClick={() => handleDelete(catalog.id)} className="w-8 h-8 rounded-full dark:bg-dark-card flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">{catalog.name}</h3>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 flex-1">{catalog.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{catalog.items?.length || 0} items</span>
                </div>
                <button onClick={() => handleEdit(catalog)} className="w-8 h-8 rounded-xl dark:bg-dark-card flex items-center justify-center text-gray-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredCatalogs.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-gray-500">
              No se encontraron catÃ¡logos.
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Editor */}
      {isEditorOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditorOpen(false)} />
          <div className="w-full max-w-2xl bg-white dark:bg-dark-card shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-gray-100 dark:border-white/5">
            {/* Editor Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-dark-card">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{editingCatalog?.id ? 'Editar CatÃ¡logo' : 'Nuevo CatÃ¡logo'}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configura los detalles e items</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsEditorOpen(false)} className="w-10 h-10 rounded-xl dark:bg-dark-card flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={handleSave} disabled={loading} className="bg-accent-500 hover:bg-accent-600 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Nombre del CatÃ¡logo</label>
                  <input type="text" placeholder="Ej. Promociones Verano" value={editingCatalog?.name || ''} onChange={e => setEditingCatalog({ ...editingCatalog, name: e.target.value })} className="w-full px-5 py-3.5 dark:bg-dark-card rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">DescripciÃ³n</label>
                  <textarea rows={3} placeholder="Describe el contenido del catÃ¡logo..." value={editingCatalog?.description || ''} onChange={e => setEditingCatalog({ ...editingCatalog, description: e.target.value })} className="w-full px-5 py-3.5 dark:bg-dark-card rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Estado</label>
                  <select value={editingCatalog?.status || 'draft'} onChange={e => setEditingCatalog({ ...editingCatalog, status: e.target.value })} className="w-full px-5 py-3.5 dark:bg-dark-card rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors appearance-none">
                    <option value="draft">Borrador</option>
                    <option value="active">Activo</option>
                  </select>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Items / Products */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Productos / Items</h3>
                  <button onClick={handleAddItem} className="text-[10px] font-black text-accent-500 uppercase tracking-widest hover:text-accent-600 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> AÃ±adir Item
                  </button>
                </div>

                <div className="space-y-4">
                  {editingCatalog?.items?.map((item: any) => (
                    <div key={item.id} className="p-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl flex items-start gap-4 group hover:border-accent-500/50 transition-colors shadow-sm">
                      
                      <div className="w-20 h-20 dark:bg-dark-card rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-gray-100 dark:border-white/5 group/img cursor-pointer">
                        {item.media_url ? (
                          <img src={item.media_url} alt="product media" className="w-full h-full object-cover" />
                        ) : (
                          item.media_type === 'video' ? <Video className="w-6 h-6 text-gray-300" /> : <ImageIcon className="w-6 h-6 text-gray-300" />
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="w-4 h-4 text-white mb-1" />
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">{uploadingImage === item.id ? 'Subiendo' : 'Subir'}</span>
                          <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleImageUpload(item.id, e)} disabled={uploadingImage === item.id} />
                        </label>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <input type="text" value={item.title || ''} onChange={e => handleItemChange(item.id, 'title', e.target.value)} placeholder="Nombre del producto" className="w-full bg-transparent text-sm font-black text-gray-900 dark:text-white outline-none placeholder:text-gray-400" />
                          <button onClick={() => handleItemChange(item.id, 'media_type', (item.media_type || item.type) === 'image' ? 'video' : 'image')} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-accent-500 whitespace-nowrap">
                            Es: {(item.media_type || item.type) === 'image' ? 'IMG' : 'VID'}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={item.price || ''} onChange={e => handleItemChange(item.id, 'price', e.target.value)} placeholder="Precio ($0.00)" className="w-1/2 px-3 py-2 dark:bg-dark-card rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors" />
                          <input type="text" value={item.url || ''} onChange={e => handleItemChange(item.id, 'url', e.target.value)} placeholder="Enlace/URL (opcional)" className="w-1/2 px-3 py-2 dark:bg-dark-card rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors" />
                        </div>
                        <textarea rows={2} value={item.description || ''} onChange={e => handleItemChange(item.id, 'description', e.target.value)} placeholder="DescripciÃ³n breve..." className="w-full px-3 py-2 dark:bg-dark-card rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none border border-transparent focus:border-accent-500 transition-colors resize-none" />
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(!editingCatalog?.items || editingCatalog.items.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400">Este catÃ¡logo estÃ¡ vacÃ­o.</p>
                      <button onClick={handleAddItem} className="mt-3 text-[10px] font-black text-accent-500 uppercase tracking-widest hover:underline">
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


