import { useState, useEffect } from 'react';
import { Bot, Plus, Edit2, Trash2, Copy, Play, Search, Users, BarChart3 } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowBuilderContent } from '../components/flow/FlowBuilderContent';
import { flowService, FlowBot } from '../services/flowService';
import { TriggerInput } from '../components/TriggerInput';

export const FlowManager = () => {
  const [flows, setFlows] = useState<FlowBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlow, setEditingFlow] = useState<FlowBot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [newFlowData, setNewFlowData] = useState({
    name: '',
    description: '',
    category: 'other' as 'sales' | 'support' | 'marketing' | 'onboarding' | 'other',
    triggers: [] as string[]
  });
  const [isCreating, setIsCreating] = useState(false);

  // Load flows from API
  useEffect(() => {
    const loadFlows = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await flowService.getFlows();
        setFlows(data);
      } catch (err) {
        console.error('Error loading flows:', err);
        setError('No se pudieron cargar los flujos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadFlows();
  }, []);

  // Refresh flows after any operation
  const refreshFlows = async () => {
    try {
      const data = await flowService.getFlows();
      setFlows(data);
    } catch (err) {
      console.error('Error refreshing flows:', err);
    }
  };

  // Funciones de filtrado y búsqueda
  const filteredAndSortedFlows = flows
    .filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || flow.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || flow.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      // Default sort by lastModified desc
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });


  const openFlowBuilder = (flow: FlowBot) => {
    setEditingFlow(flow);
  };

  const closeFlowBuilder = () => {
    setEditingFlow(null);
  };


  const duplicateFlow = async (flow: FlowBot) => {
    try {
      await flowService.duplicateFlow(flow.id);
      await refreshFlows();
    } catch (err) {
      console.error('Error duplicating flow:', err);
      setError('No se pudo duplicar el flujo. Por favor, intenta de nuevo.');
    }
  };

  const deleteFlow = async (flowId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este flujo?')) {
      try {
        await flowService.deleteFlow(flowId);
        await refreshFlows();
      } catch (err) {
        console.error('Error deleting flow:', err);
        setError('No se pudo eliminar el flujo. Por favor, intenta de nuevo.');
      }
    }
  };

  const toggleFlowStatus = async (flowId: string) => {
    try {
      await flowService.toggleFlowStatus(flowId);
      await refreshFlows();
    } catch (err) {
      console.error('Error toggling flow status:', err);
      setError('No se pudo cambiar el estado del flujo.');
    }
  };

  const createFlow = async () => {
    if (!newFlowData.name.trim()) {
      setError('El nombre del flujo es obligatorio');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      // Create initial trigger node
      const triggerNode = {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Inicio',
          description: 'Este es el punto de inicio de tu flujo'
        }
      };

      const flowData = {
        name: newFlowData.name.trim(),
        description: newFlowData.description.trim(),
        category: newFlowData.category,
        triggers: newFlowData.triggers,
        status: 'draft' as const,
        version: '1.0.0',
        nodes: [triggerNode],
        edges: [],
        metrics: {
          conversations: 0,
          completionRate: 0,
          avgResponseTime: 0,
          satisfaction: 0
        }
      };

      const newFlow = await flowService.createFlow(flowData);
      await refreshFlows();
      
      // Reset form and close modal
      setNewFlowData({
        name: '',
        description: '',
        category: 'other',
        triggers: []
      });
      setShowCreateForm(false);
      
      // Open the new flow in the builder
      openFlowBuilder(newFlow);
    } catch (err) {
      console.error('Error creating flow:', err);
      setError('No se pudo crear el flujo. Por favor, intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const stats = {
    total: flows.length,
    active: flows.filter(f => f.status === 'active').length,
    draft: flows.filter(f => f.status === 'draft').length,
    totalConversations: flows.reduce((acc, f) => acc + f.metrics.conversations, 0),
    avgCompletionRate: flows.length > 0 ? Math.round(flows.reduce((acc, f) => acc + f.metrics.completionRate, 0) / flows.length) : 0
  };

  if (editingFlow) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <ReactFlowProvider>
          <FlowBuilderContent flowData={editingFlow} onBack={closeFlowBuilder} />
        </ReactFlowProvider>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando flujos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600 dark:text-red-400">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar los flujos</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 p-4 lg:p-5 space-y-4 relative overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-5 lg:p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-xl duration-500">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestor de <span className="text-primary-500 dark:text-primary-400">Bots</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
              Crea, edita y gestiona todos tus flujos de automatización en un solo lugar.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Flujo
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl'
                  : 'text-slate-400 dark:text-slate-500 hover:text-primary-500'
                  }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl'
                  : 'text-slate-400 dark:text-slate-500 hover:text-primary-500'
                  }`}
              >
                List
              </button>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
              Nuevo Flujo
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Flujos', value: stats.total, icon: Bot, color: 'slate', trend: '+12%' },
            { label: 'Flujos Activos', value: stats.active, icon: Play, color: 'emerald', trend: '+8%' },
            { label: 'Borradores', value: stats.draft, icon: Edit2, color: 'amber', trend: '-3%' },
            { label: 'Conversaciones', value: stats.totalConversations.toLocaleString(), icon: Users, color: 'primary', trend: '+25%' },
            { label: 'Completación', value: `${stats.avgCompletionRate}%`, icon: BarChart3, color: 'secondary', trend: '+5%' },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden bg-white dark:bg-[#11141b] p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-500">
              <div className={`absolute top-0 right-0 w-16 h-16 bg-${stat.color}-500/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-${stat.color}-500/10 transition-colors duration-500`} />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className={`p-2 bg-${stat.color}-500/10 rounded-xl`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-500 dark:text-${stat.color}-400`} />
                </div>
                <span className={`text-[9px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-secondary-500'} bg-white dark:bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm`}>
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[1.5rem] p-4 border border-gray-200 dark:border-gray-800/50 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar flujos por nombre, descripción o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-white font-black uppercase tracking-widest text-[9px] cursor-pointer"
              >
                <option value="all">Categorías (Todas)</option>
                <option value="sales">Ventas</option>
                <option value="support">Soporte</option>
                <option value="marketing">Marketing</option>
                <option value="onboarding">Onboarding</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-white font-black uppercase tracking-widest text-[9px] cursor-pointer"
              >
                <option value="all">Estados (Todos)</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto">
            {filteredAndSortedFlows.map((flow) => (
              <div key={flow.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <div className="h-full bg-white dark:bg-[#11141b] rounded-[1.5rem] p-5 border border-gray-100 dark:border-gray-800/50 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
                  {/* Flow Category Banner */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-black text-[8px] uppercase tracking-[0.2em] border-l border-b border-gray-100 dark:border-gray-800/50 ${flow.category === 'sales' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                    flow.category === 'support' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' :
                      flow.category === 'marketing' ? 'bg-pink-50 text-pink-600 dark:bg-pink-500/10' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    }`}>
                    {flow.category}
                  </div>

                  <div className="flex items-start gap-4 mb-4 mt-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-3 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <Bot className="w-full h-full text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {flow.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => toggleFlowStatus(flow.id)}
                          className={`w-8 h-4 rounded-full relative transition-colors duration-300 border border-slate-200 dark:border-slate-700 ${flow.status === 'active' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                          <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${flow.status === 'active' ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${flow.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {flow.status === 'active' ? 'En ejecución' : 'Pausado'}
                        </span>
                        {flow.isDefault && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-md border border-amber-100 dark:border-amber-500/20 ml-1">Default</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-4 min-h-[2.5rem] leading-relaxed italic text-sm">
                    "{flow.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversaciones</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{flow.metrics.conversations.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completación</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{flow.metrics.completionRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openFlowBuilder(flow)}
                        className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateFlow(flow)}
                        className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteFlow(flow.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-transparent border-b border-gray-100 dark:border-gray-800/50">
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Flujo / Descripción</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Triggers</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Estado / Categoría</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Rendimiento</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {filteredAndSortedFlows.map((flow) => (
                    <tr key={flow.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center p-3 shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Bot className="w-full h-full text-white" />
                          </div>
                          <div className="max-w-md">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                {flow.name}
                              </h3>
                              {flow.isDefault && <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">Default</span>}
                            </div>
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 line-clamp-1 italic">"{flow.description}"</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-wrap gap-2">
                          {flow.triggers && flow.triggers.length > 0 ? (
                            flow.triggers.map((trigger, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                              >
                                {trigger}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">
                              Sin triggers
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleFlowStatus(flow.id)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 border border-slate-200 dark:border-slate-700 ${flow.status === 'active' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                          >
                            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${flow.status === 'active' ? 'left-6.5' : 'left-1'}`} />
                          </button>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${flow.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                              {flow.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{flow.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-8">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversaciones</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{flow.metrics.conversations}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasa Éxito</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{flow.metrics.completionRate}%</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <button onClick={() => openFlowBuilder(flow)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => duplicateFlow(flow)} className="p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all">
                            <Copy className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteFlow(flow.id)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all hover:scale-110">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Flow Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#11141b] rounded-[3rem] shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800/50 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="p-10 space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                    <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Crear Nuevo Flujo</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                      Configura tu nuevo bot de automatización
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Nombre del Flujo *
                    </label>
                    <input
                      type="text"
                      value={newFlowData.name}
                      onChange={(e) => setNewFlowData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Bot de Ventas, Asistente de Soporte"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold"
                      disabled={isCreating}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Descripción
                    </label>
                    <textarea
                      value={newFlowData.description}
                      onChange={(e) => setNewFlowData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe qué hace este bot y para qué sirve..."
                      rows={3}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold resize-none"
                      disabled={isCreating}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Categoría
                    </label>
                    <select
                      value={newFlowData.category}
                      onChange={(e) => setNewFlowData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold cursor-pointer"
                      disabled={isCreating}
                    >
                      <option value="other">Otro</option>
                      <option value="sales">Ventas</option>
                      <option value="support">Soporte</option>
                      <option value="marketing">Marketing</option>
                      <option value="onboarding">Onboarding</option>
                    </select>
                  </div>

                  {/* Triggers */}
                  <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Palabras Clave de Activación
                    </label>
                    <TriggerInput
                      triggers={newFlowData.triggers}
                      onChange={(triggers) => setNewFlowData(prev => ({ ...prev, triggers }))}
                      placeholder="Ej: hola, ayuda, información"
                      disabled={isCreating}
                      className="mb-2"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Estas palabras activarán el flujo cuando un usuario las envíe
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setError(null);
                      setNewFlowData({
                        name: '',
                        description: '',
                        category: 'other',
                        triggers: []
                      });
                    }}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    disabled={isCreating}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createFlow}
                    disabled={isCreating || !newFlowData.name.trim()}
                    className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-wider text-xs shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Crear Flujo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
