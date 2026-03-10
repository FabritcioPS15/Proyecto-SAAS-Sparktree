import { useState, useEffect } from 'react';
import { Bot, Plus, Edit2, Trash2, Copy, Play, Search, Users, BarChart3, Check, Circle, ChevronRight } from 'lucide-react';
import { FlowBuilderContent } from '../components/flow/FlowBuilderContent';
import { flowService, FlowBot } from '../services/flowService';

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
      await flowService.duplicateFlow(flow._id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      case 'draft': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return (
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          Activo
        </div>
      );
      case 'inactive': return (
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-red-600" />
          Inactivo
        </div>
      );
      case 'draft': return (
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-gray-600" />
          Borrador
        </div>
      );
      default: return status;
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
    // Show FlowBuilder component with the selected flow
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={closeFlowBuilder}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 group"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 rotate-180 group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="group">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                      Editando: {editingFlow.name}
                    </h2>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">
                      Versión {editingFlow.version} • {editingFlow.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-800 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editando
                  </div>
                  <button
                    onClick={closeFlowBuilder}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Flow Builder */}
          <div className="flex-1 overflow-hidden">
            <FlowBuilderContent flowData={editingFlow} />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="h-[calc(100vh-8rem)] min-h-[600px] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-10 relative">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-10 rounded-[2.5rem] border border-gray-200 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-xl duration-500">
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-2">
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-500/20">
                Flow Engine v2.0
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-black">Flujos</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
              Diseña, optimiza y despliega experiencias conversacionales inteligentes con nuestro motor de flujos avanzado.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl'
                  : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'
                  }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl'
                  : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'Total Flujos', value: stats.total, icon: Bot, color: 'slate', trend: '+12%' },
            { label: 'Flujos Activos', value: stats.active, icon: Play, color: 'emerald', trend: '+8%' },
            { label: 'Borradores', value: stats.draft, icon: Edit2, color: 'amber', trend: '-3%' },
            { label: 'Conversaciones', value: stats.totalConversations.toLocaleString(), icon: Users, color: 'indigo', trend: '+25%' },
            { label: 'Completación', value: `${stats.avgCompletionRate}%`, icon: BarChart3, color: 'purple', trend: '+5%' },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden bg-white dark:bg-[#11141b] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors duration-500`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500 dark:text-${stat.color}-400`} />
                </div>
                <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} bg-white dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm`}>
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[2.5rem] p-6 border border-gray-200 dark:border-gray-800/50 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar flujos por nombre, descripción o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-8 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-white font-black uppercase tracking-widest text-[10px] cursor-pointer"
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
                className="px-8 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-white font-black uppercase tracking-widest text-[10px] cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAndSortedFlows.map((flow) => (
              <div key={flow._id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <div className="h-full bg-white dark:bg-[#11141b] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800/50 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                  {/* Flow Category Banner */}
                  <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-[0.2em] border-l border-b border-gray-100 dark:border-gray-800/50 ${flow.category === 'sales' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                    flow.category === 'support' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' :
                      flow.category === 'marketing' ? 'bg-pink-50 text-pink-600 dark:bg-pink-500/10' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    }`}>
                    {flow.category}
                  </div>

                  <div className="flex items-start gap-6 mb-8 mt-4">
                    <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                      <Bot className="w-full h-full text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {flow.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${flow.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{flow.status}</span>
                        {flow.isDefault && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-amber-100 dark:border-amber-500/20 ml-2">Default</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-8 min-h-[3rem] leading-relaxed italic">
                    "{flow.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversaciones</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{flow.metrics.conversations.toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completación</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{flow.metrics.completionRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openFlowBuilder(flow)}
                        className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => duplicateFlow(flow)}
                        className="p-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteFlow(flow._id)}
                      className="p-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all hover:scale-105"
                    >
                      <Trash2 className="w-5 h-5" />
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
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Estado / Categoría</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Rendimiento</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {filteredAndSortedFlows.map((flow) => (
                    <tr key={flow._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
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
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(flow.status)} px-4`}>
                            {getStatusText(flow.status)}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{flow.category}</span>
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
                          <button onClick={() => deleteFlow(flow._id)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all hover:scale-110">
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
            <div className="bg-white dark:bg-[#11141b] rounded-[3rem] shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800/50 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center space-y-8">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                  <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Constructor Visual</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Estamos terminando de pulir el nuevo constructor visual de flujos. Pronto podrás arrastrar y soltar bloques para crear experiencias increíbles.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
