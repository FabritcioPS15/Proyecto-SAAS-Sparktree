import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Plus, Edit2, Trash2, Copy, Play, Search, Users, BarChart3, LayoutGrid, List } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowBuilderContent } from '../components/flow/FlowBuilderContent';
import { flowService, FlowBot } from '../services/flowService';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

export const FlowManager = () => {
  const [flows, setFlows] = useState<FlowBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlow, setEditingFlow] = useState<FlowBot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newFlowData, setNewFlowData] = useState({
    name: '',
    description: '',
    category: 'other' as 'sales' | 'support' | 'marketing' | 'onboarding' | 'other',
    triggers: [] as string[]
  });
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickEditName, setQuickEditName] = useState('');

  // Load flows from API
  useEffect(() => {
    const loadFlows = async () => {
      try {
        setLoading(true);
        const data = await flowService.getFlows();
        setFlows(data);
      } catch (err) {
        console.error('Error loading flows:', err);
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

  const filteredAndSortedFlows = flows
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
      await refreshFlows();
    } catch (err) {
      console.error('Error duplicating flow:', err);
    }
  };

  const deleteFlow = async (flowId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este flujo?')) {
      try {
        await flowService.deleteFlow(flowId);
        await refreshFlows();
      } catch (err) {
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
      await refreshFlows();
      setShowCreateForm(false);
      setNewFlowData({ name: '', description: '', category: 'other', triggers: [] });
      openFlowBuilder(newFlow);
    } catch (err) {
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

  const renderEditor = () => {
    if (!editingFlow) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100000] bg-white dark:bg-[#0f1117] flex flex-col pt-0">
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
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-xl p-0 border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Cuadrícula"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Lista"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-5 h-10 bg-black dark:bg-accent-500 text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Nuevo Flujo
            </button>
          </div>
        }
      />

      <PageBody scrollable={true}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Flujos', value: stats.total, icon: Bot },
            { label: 'Activos', value: stats.active, icon: Play },
            { label: 'Borradores', value: stats.draft, icon: Edit2 },
            { label: 'Conversaciones', value: stats.totalConversations, icon: Users },
            { label: 'Éxito', value: `${stats.avgCompletionRate}%`, icon: BarChart3 },
          ].map((stat, i) => (
            <div key={i} className="bg-white/60 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/30 transition-all hover:border-accent-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-accent-500 shadow-sm"><stat.icon className="w-4 h-4" /></div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/40 dark:bg-slate-800/20 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/30 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar flujos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-5 bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-5 h-11 bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none hover:bg-white dark:hover:bg-slate-900 transition-colors pr-10"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="all">Categorías (Todas)</option>
                <option value="sales">Ventas</option>
                <option value="support">Soporte</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedFlows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => openFlowBuilder(flow)}
                className="group cursor-pointer bg-white dark:bg-[#11141b] rounded-2xl p-6 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-sm font-bold outline-none ring-2 ring-primary-500"
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
                    {(flow as any).activeConnections?.map((conn: any) => (
                      <div 
                        key={conn.id} 
                        className="w-5 h-5 rounded-full bg-primary-500 border-2 border-white dark:border-[#11141b] flex items-center justify-center text-[7px] font-black text-white shadow-sm"
                        title={conn.display_name}
                      >
                        {conn.display_name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {flow.triggers?.length > 0 ? (
                    flow.triggers.slice(0, 4).map((t, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tight">
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
          <div className="bg-white dark:bg-[#11141b] rounded-2xl border border-gray-100 dark:border-gray-800/50 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-transparent border-b border-gray-100 dark:border-gray-800/50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                  <th className="px-8 py-6">Flujo</th>
                  <th className="px-8 py-6">Triggers</th>
                  <th className="px-8 py-6">Configuración</th>
                  <th className="px-8 py-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {filteredAndSortedFlows.map((flow) => (
                  <tr
                    key={flow.id}
                    onClick={() => openFlowBuilder(flow)}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-8 py-6">
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
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {flow.triggers?.slice(0, 3).map((t, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold text-slate-500">{t}</span>)}
                        {flow.triggers?.length > 3 && <span className="text-[9px] font-bold text-slate-300">+{flow.triggers.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] font-black uppercase ${flow.matchingStrategy === 'flexible' ? 'text-amber-500' : 'text-primary-600'}`}>
                            {flow.matchingStrategy === 'flexible' ? 'Inteligente' : 'Estricto'}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400">{flow.nodes?.length || 0} nodos</span>
                        </div>
                        <div className="flex items-center -space-x-1.5 ml-4">
                          {(flow as any).activeConnections?.map((conn: any) => (
                            <div 
                              key={conn.id} 
                              className="w-4 h-4 rounded-full bg-primary-500 border border-white dark:border-[#11141b] flex items-center justify-center text-[7px] font-black text-white shadow-sm"
                              title={conn.display_name}
                            >
                              {conn.display_name?.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openFlowBuilder(flow)} className="p-2 bg-primary-600 text-white rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFlow(flow.id);
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreateForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[110]">
            <div className="bg-white dark:bg-[#11141b] rounded-3xl shadow-xl max-w-xl w-full p-10 font-inter">
              <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white uppercase tracking-tighter">Crear Nuevo Flujo</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Nombre del Flujo</label>
                  <input type="text" value={newFlowData.name} onChange={e => setNewFlowData({ ...newFlowData, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-slate-900 dark:text-white" placeholder="Ej: Soporte VIP" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Categoría</label>
                  <select value={newFlowData.category} onChange={e => setNewFlowData({ ...newFlowData, category: e.target.value as any })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-slate-900 dark:text-white">
                    <option value="sales">Ventas</option><option value="support">Soporte</option><option value="marketing">Marketing</option><option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Palabras Clave (Triggers)</label>
                  <input
                    type="text"
                    value={newFlowData.triggers.join(', ')}
                    onChange={e => setNewFlowData({ ...newFlowData, triggers: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-slate-900 dark:text-white"
                    placeholder="Ej: hola, precio, info (separadas por coma)"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowCreateForm(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase transition-all hover:bg-slate-200">Cancelar</button>
                  <button onClick={createFlow} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Crear Bot</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageBody>
    </PageContainer>
  );
};
