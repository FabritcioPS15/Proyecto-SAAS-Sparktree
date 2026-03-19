import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Plus, Edit2, Trash2, Copy, Play, Search, Users, BarChart3 } from 'lucide-react';
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
  const closeFlowBuilder = () => setEditingFlow(null);

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
        title="Gestor de"
        highlight="Flujos AI"
        description="Configura el comportamiento y las respuestas automatizadas de tu bot."
        icon={Bot}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/50">
              <button onClick={() => setViewMode('grid')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400'}`}>Grid</button>
              <button onClick={() => setViewMode('list')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400'}`}>List</button>
            </div>
            <button onClick={() => setShowCreateForm(true)} className="px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-5 h-5" strokeWidth={3} /> Nuevo Flujo
            </button>
          </div>
        }
      />

      <PageBody scrollable={true}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Flujos', value: stats.total, icon: Bot, color: 'indigo' },
            { label: 'Flujos Activos', value: stats.active, icon: Play, color: 'emerald' },
            { label: 'Borradores', value: stats.draft, icon: Edit2, color: 'amber' },
            { label: 'Conversaciones', value: stats.totalConversations, icon: Users, color: 'blue' },
            { label: 'Éxito', value: `${stats.avgCompletionRate}%`, icon: BarChart3, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/40 dark:bg-slate-800/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><stat.icon className="w-4 h-4 text-slate-600" /></div>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/40 dark:bg-slate-800/20 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-700/30 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar flujos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold"
              />
            </div>
            <div className="flex gap-3">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-5 py-4 bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-[9px] font-black uppercase outline-none">
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
              <div key={flow.id} className="group bg-white dark:bg-[#11141b] rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center p-3 text-white"><Bot className="w-full h-full" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black truncate">{flow.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${flow.matchingStrategy === 'flexible' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-primary-50 text-primary-600 border-primary-100'}`}>
                        {flow.matchingStrategy === 'flexible' ? 'Modo Inteligente' : 'Modo Estricto'}
                      </span>
                      {flow.reactivationTime && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{flow.reactivationTime}m recarga</span>}
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm italic line-clamp-2 mb-6 min-h-[40px]">"{flow.description}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/50">
                  <div className="flex gap-2">
                    <button onClick={() => openFlowBuilder(flow)} className="p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-105 transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => duplicateFlow(flow)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:scale-105 transition-all"><Copy className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => deleteFlow(flow.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 overflow-hidden">
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
                  <tr key={flow.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-2 text-white"><Bot className="w-full h-full" /></div>
                        <div><h4 className="font-black text-slate-900 dark:text-white leading-none mb-1">{flow.name}</h4><p className="text-xs text-slate-400 italic">{flow.category}</p></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {flow.triggers?.map((t, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[9px] font-black uppercase ${flow.matchingStrategy === 'flexible' ? 'text-amber-500' : 'text-primary-600'}`}>
                          {flow.matchingStrategy === 'flexible' ? 'Inteligente' : 'Estricto'}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">{flow.reactivationTime}m de espera</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openFlowBuilder(flow)} className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteFlow(flow.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
            <div className="bg-white dark:bg-[#11141b] rounded-[3rem] shadow-2xl max-w-xl w-full p-10 font-inter">
              <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white uppercase tracking-tighter">Crear Nuevo Flujo</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Nombre del Flujo</label>
                  <input type="text" value={newFlowData.name} onChange={e => setNewFlowData({...newFlowData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-slate-900 dark:text-white" placeholder="Ej: Soporte VIP" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Categoría</label>
                  <select value={newFlowData.category} onChange={e => setNewFlowData({...newFlowData, category: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-slate-900 dark:text-white">
                    <option value="sales">Ventas</option><option value="support">Soporte</option><option value="marketing">Marketing</option><option value="other">Otro</option>
                  </select>
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
