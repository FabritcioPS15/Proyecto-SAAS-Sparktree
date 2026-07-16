import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Plus, Edit2, Trash2, Copy, Search, LayoutGrid, List } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowBuilderContent } from '../components/FlowBuilderContent';
import { flowService, FlowBot } from '../../../services/flowService';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { PageLoader } from '../../../components/layout/PageLoader';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { useNotifications } from '../../../contexts/NotificationContext';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger, FaTiktok } from 'react-icons/fa';

const PLATFORM_ICONS: Record<string, any> = {
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  instagram: FaInstagram,
  messenger: FaFacebookMessenger,
  tiktok: FaTiktok
};

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: 'bg-emerald-500 text-white',
  telegram: 'bg-sky-500 text-white',
  instagram: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white',
  messenger: 'bg-blue-600 text-white',
  tiktok: 'bg-black text-white'
};

export const FlowManager = () => {
  const [flows, setFlows] = useState<FlowBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlow, setEditingFlow] = useState<FlowBot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newFlowData, setNewFlowData] = useState({
    name: '',
    description: '',
    category: 'other' as 'sales' | 'support' | 'marketing' | 'onboarding' | 'other',
    triggers: [] as string[]
  });
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickEditName, setQuickEditName] = useState('');
  const { addNotification } = useNotifications();

  // Load flows from API
  useEffect(() => {
    const loadFlows = async () => {
      try {
        setLoading(true);
        const data = await flowService.getFlows();
        setFlows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading flows:', err);
        setFlows([]);
      } finally {
        setLoading(false);
      }
    };
    loadFlows();
  }, []);

  const refreshFlows = async () => {
    try {
      const data = await flowService.getFlows();
      setFlows(data);
    } catch (err) {
      console.error('Error refreshing flows:', err);
    }
  };

  const filteredAndSortedFlows = (Array.isArray(flows) ? flows : [])
    .filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || flow.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.lastModified || '').getTime() - new Date(a.lastModified || '').getTime());

  const openFlowBuilder = (flow: FlowBot) => setEditingFlow(flow);
  const closeFlowBuilder = () => {
    setEditingFlow(null);
    refreshFlows(); // Essential to show saved changes when returning to the manager
  };

  const duplicateFlow = async (flow: FlowBot) => {
    try {
      await flowService.duplicateFlow(flow.id);
      addNotification({ type: 'success', title: 'Flujo duplicado', message: `"${flow.name}" fue duplicado correctamente.` });
      await refreshFlows();
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo duplicar el flujo.' });
      console.error('Error duplicating flow:', err);
    }
  };

  const deleteFlow = async (flowId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este flujo?')) {
      try {
        await flowService.deleteFlow(flowId);
        addNotification({ type: 'success', title: 'Flujo eliminado', message: 'El flujo fue eliminado correctamente.' });
        await refreshFlows();
      } catch (err) {
        addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el flujo.' });
        console.error('Error deleting flow:', err);
      }
    }
  };

  const createFlow = async () => {
    if (!newFlowData.name.trim()) return;
    try {
      setLoading(true);
      const newFlow = await flowService.createFlow({
        ...newFlowData,
        status: 'draft',
        nodes: [{ id: 'trigger_1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Inicio', keywords: newFlowData.triggers } }],
        edges: []
      });
      addNotification({ type: 'success', title: 'Flujo creado', message: `"${newFlowData.name}" fue creado. Ahora puedes configurarlo.` });
      await refreshFlows();
      setShowCreateForm(false);
      setNewFlowData({ name: '', description: '', category: 'other', triggers: [] });
      openFlowBuilder(newFlow);
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo crear el flujo.' });
      console.error('Error creating flow:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: flows.length,
    active: flows.filter(f => f.status === 'active').length,
    draft: flows.filter(f => f.status === 'draft').length,
    totalConversations: flows.reduce((acc, f) => acc + (f.metrics?.conversations || 0), 0),
    avgCompletionRate: flows.length > 0 ? Math.round(flows.reduce((acc, f) => acc + (f.metrics?.completionRate || 0), 0) / flows.length) : 0
  };

  const paginatedFlows = filteredAndSortedFlows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAndSortedFlows.length / itemsPerPage);

  const columns = [
    {
      key: 'flow',
      header: 'Flujo',
      render: (flow: FlowBot) => (
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 text-white transition-colors duration-500 ${flow.status === 'active' ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-900'}`}>
            <Bot className="w-full h-full" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white leading-none mb-1">{flow.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{flow.category}</p>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className={`text-[10px] font-black uppercase ${flow.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                {flow.status === 'active' ? 'En Línea' : 'Borrador'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'triggers',
      header: 'Triggers',
      render: (flow: FlowBot) => (
        <div className="flex flex-wrap gap-1">
          {flow.triggers?.slice(0, 3).map((t, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold text-slate-500">{t}</span>)}
          {flow.triggers?.length > 3 && <span className="text-[9px] font-bold text-slate-300">+{flow.triggers.length - 3}</span>}
        </div>
      )
    },
    {
      key: 'config',
      header: 'Configuración',
      render: (flow: FlowBot) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className={`text-[9px] font-black uppercase ${flow.matchingStrategy === 'flexible' ? 'text-amber-500' : 'text-primary-600'}`}>
              {flow.matchingStrategy === 'flexible' ? 'Inteligente' : 'Estricto'}
            </span>
            <span className="text-[9px] font-medium text-slate-400">{flow.nodes?.length || 0} nodos</span>
          </div>
          <div className="flex items-center -space-x-1.5 ml-4">
            {(() => {
              const mockPlatforms = flow.status === 'active' 
                ? ['whatsapp', 'messenger'].slice(0, Math.floor(Math.random() * 2) + 1)
                : [];
              const platforms = (flow as any).platforms || mockPlatforms;
              
              return platforms.map((platform: string) => {
                const Icon = PLATFORM_ICONS[platform];
                const colorClass = PLATFORM_COLORS[platform] || 'bg-gray-500 text-white';
                if (!Icon) return null;
                
                return (
                  <div 
                    key={platform} 
                    className={`w-5 h-5 rounded-full border border-white dark:border-dark-card flex items-center justify-center shadow-sm ${colorClass}`}
                    title={`Corriendo en ${platform}`}
                  >
                    <Icon size={10} color="white" />
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-center',
      render: (flow: FlowBot) => (
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => openFlowBuilder(flow)} className="p-2 bg-primary-600 text-white rounded-lg"><Edit2 className="w-4 h-4" /></button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFlow(flow.id);
            }}
            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const renderEditor = () => {
    if (!editingFlow) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100000] bg-white dark:bg-[#252525] flex flex-col pt-0">
        <ReactFlowProvider>
          <FlowBuilderContent flowData={editingFlow} onBack={closeFlowBuilder} />
        </ReactFlowProvider>
      </div>,
      document.body
    );
  };

  if (loading) return <PageLoader sectionName="Gestor de Flujos" />;

  return (
    <PageContainer>
      {renderEditor()}
      <PageHeader
        title="Constructor de"
        highlight="Bots AI"
        description="Configura el comportamiento y las respuestas automatizadas de tu bot."
        icon={Bot}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Nuevo Flujo
            </button>
          </div>
        }
      />

      <PageBody scrollable={true}>


        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar flujos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                value={filterCategory}
                onChange={(v) => setFilterCategory(v)}
                options={[
                  { value: 'all', label: 'Categorías (Todas)' },
                  { value: 'sales', label: 'Ventas' },
                  { value: 'support', label: 'Soporte' },
                  { value: 'marketing', label: 'Marketing' },
                ]}
              />
              
              <div className="flex items-center dark:bg-dark-card rounded-xl p-1 border border-gray-200 dark:border-white/5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  title="Vista de Tabla"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  title="Vista de Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedFlows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => openFlowBuilder(flow)}
                className="group cursor-pointer bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-3 text-white transition-all duration-500 ${flow.status === 'active' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20' : 'bg-slate-900 shadow-lg shadow-slate-900/10'}`}>
                    <Bot className="w-full h-full animate-pulse-slow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {quickEditId === flow.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={quickEditName}
                          onChange={(e) => setQuickEditName(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              await flowService.updateFlow(flow.id, { name: quickEditName });
                              setQuickEditId(null);
                              refreshFlows();
                            }
                            if (e.key === 'Escape') setQuickEditId(null);
                          }}
                          className="w-full dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-sm font-bold outline-none ring-2 ring-primary-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <h3 className="text-lg font-black truncate">{flow.name}</h3>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickEditId(flow.id);
                            setQuickEditName(flow.name);
                          }}
                          className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-primary-500 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${flow.matchingStrategy === 'flexible' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-accent-50 text-accent-600 border-accent-100'}`}>
                        {flow.matchingStrategy === 'flexible' ? 'Inteligente' : 'Estricto'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${flow.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {flow.status === 'active' ? 'En Línea' : 'Borrador'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center -space-x-1.5 ml-auto">
                    {(() => {
                      // Simular plataformas si no vienen del backend para mostrar la interfaz
                      const mockPlatforms = flow.status === 'active' 
                        ? ['whatsapp', 'messenger'].slice(0, Math.floor(Math.random() * 2) + 1)
                        : [];
                        
                      const platforms = (flow as any).platforms || mockPlatforms;
                      
                      return platforms.map((platform: string) => {
                        const Icon = PLATFORM_ICONS[platform];
                        const colorClass = PLATFORM_COLORS[platform] || 'bg-gray-500 text-white';
                        if (!Icon) return null;
                        
                        return (
                          <div 
                            key={platform} 
                            className={`w-6 h-6 rounded-full border-2 border-white dark:border-dark-card flex items-center justify-center shadow-sm relative group/plat ${colorClass}`}
                            title={`Corriendo en ${platform}`}
                          >
                            <Icon size={12} color="white" />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {flow.triggers?.length > 0 ? (
                    flow.triggers.slice(0, 4).map((t, i) => (
                      <span key={i} className="px-2 py-1 dark:bg-white/5 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight italic">Sin disparadores</span>
                  )}
                  {flow.triggers?.length > 4 && (
                    <span className="text-[9px] font-bold text-slate-300">+{flow.triggers.length - 4}</span>
                  )}
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-[13px] italic line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
                  {flow.description || 'Sin descripción disponible para este flujo.'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-white/2 p-2.5 rounded-xl border border-slate-100/50 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Interacciones</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{flow.metrics?.conversations || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/2 p-2.5 rounded-xl border border-slate-100/50 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nodos</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{flow.nodes?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/50">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateFlow(flow);
                      }}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:scale-105 transition-all text-slate-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFlow(flow.id);
                    }}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={paginatedFlows}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        )}
        </div>

        <Modal
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Crear Nuevo Flujo"
          icon={<div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"><Bot className="w-5 h-5 text-black" /></div>}
          footer={
            <div className="flex gap-3">
              <button onClick={() => setShowCreateForm(false)}
                className="flex-1 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Cancelar
              </button>
              <button onClick={createFlow}
                className="flex-1 h-11 bg-gradient-to-r from-accent-500 to-emerald-500 hover:from-accent-600 hover:to-emerald-600 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md">
                Crear Bot
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Flujo</label>
              <input type="text" value={newFlowData.name} onChange={e => setNewFlowData({ ...newFlowData, name: e.target.value })}
                className="w-full h-10 px-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-slate-400"
                placeholder="Ej: Soporte VIP" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Categoría</label>
              <Dropdown
                value={newFlowData.category}
                onChange={v => setNewFlowData({ ...newFlowData, category: v as any })}
                options={[
                  { value: 'sales', label: 'Ventas' },
                  { value: 'support', label: 'Soporte' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'other', label: 'Otro' },
                ]}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Palabras Clave (Triggers)</label>
              <input type="text" value={newFlowData.triggers.join(', ')}
                onChange={e => setNewFlowData({ ...newFlowData, triggers: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
                className="w-full h-10 px-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-slate-400"
                placeholder="Ej: hola, precio, info (separadas por coma)" />
            </div>
          </div>
        </Modal>
      </PageBody>
    </PageContainer>
  );
};


