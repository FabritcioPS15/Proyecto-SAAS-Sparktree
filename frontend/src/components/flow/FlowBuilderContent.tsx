import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './TriggerNode';
import { TextNode } from './TextNode';
import { InteractiveNode } from './InteractiveNode';
import { MediaNode } from './MediaNode';
import { CaptureNode } from './CaptureNode';
import { WebhookNode } from './WebhookNode';
import { HandoffNode } from './HandoffNode';
import { DelayNode } from './DelayNode';
import { FlowSimulator } from './FlowSimulator';
import { TriggerInput } from '../TriggerInput';
import {
  Save, Bot, Play, Zap, Settings, Layers, Grid3X3, Sparkles,
  Undo2, Redo2, Maximize2, Trash2, MessageSquare,
  Clock, UserCheck, ChevronRight, Plus, MousePointer2
} from 'lucide-react';
import { saveFlows } from '../../services/api';

const nodeTypes = {
  trigger: TriggerNode,
  text: TextNode,
  interactive: InteractiveNode,
  media: MediaNode,
  capture: CaptureNode,
  webhook: WebhookNode,
  handoff: HandoffNode,
  delay: DelayNode,
};

interface FlowBuilderContentProps {
  flowData: {
    id: string;
    _id?: string;
    name: string;
    nodes: any[];
    edges: any[];
    triggers: string[];
    category: string;
    status?: string;
  };
  onBack?: () => void;
}

export const FlowBuilderContent = ({ flowData, onBack }: FlowBuilderContentProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges || []);
  const [currentTriggers, setCurrentTriggers] = useState(flowData.triggers || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(flowData.status === 'active');
  const [history, setHistory] = useState([{ nodes: flowData.nodes || [], edges: flowData.edges || [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState<'nodos' | 'propiedades'>('nodos');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
    setActiveTab('propiedades');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;
    const updatedData = { ...selectedNode.data, ...newData };
    const updatedNode = { ...selectedNode, data: updatedData };

    setSelectedNode(updatedNode);
    setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? updatedNode : n));
  };

  const pushToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const clearCanvas = () => {
    if (window.confirm('¿Limpiar todo el flow?')) {
      setNodes([]);
      setEdges([]);
      pushToHistory();
    }
  };

  const onConnect = useCallback(
    (params: any) => {
      pushToHistory();
      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, edges, historyIndex]
  );

  // Helper function to handle trigger input properly
  const handleTriggersChange = (triggers: string[]) => {
    setCurrentTriggers(triggers);
    setNodes((nds) => nds.map((n) => n.type === 'trigger' ? { ...n, data: { ...n.data, keywords: triggers } } : n));
  };

  const saveFlow = async () => {
    setIsSaving(true);
    try {
      await saveFlows({
        name: flowData.name,
        nodes,
        edges,
        triggers: currentTriggers,
        status: isFlowActive ? 'active' : 'draft',
        category: flowData.category
      }, flowData.id || flowData._id);
      flowData.triggers = currentTriggers;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save flow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNode = (type: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 250, y: 100 },
      data: type === 'trigger' ? { keywords: currentTriggers } : {}
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes, newNode], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
    setNodes([...nodes, newNode]);
    setActiveTab('propiedades');
    setSelectedNode(newNode);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        else if (e.key === 'y') { e.preventDefault(); redo(); }
        else if (e.key === 's') { e.preventDefault(); saveFlow(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex, nodes, edges, isFlowActive, currentTriggers]);

  // Node palette data
  const chatNodes = [
    { id: 'trigger', icon: Zap, label: 'Palabra Clave', sub: 'Disparador inicial', color: 'emerald' },
    { id: 'text', icon: Sparkles, label: 'Mensaje Texto', sub: 'Respuesta simple', color: 'blue' },
    { id: 'interactive', icon: Grid3X3, label: 'Botones/Listas', sub: 'Interacción', color: 'primary' },
    { id: 'media', icon: Play, label: 'Multimedia', sub: 'Imágenes y Vídeo', color: 'accent' },
    { id: 'capture', icon: MessageSquare, label: 'Capturar Dato', sub: 'Recolectar info', color: 'amber' },
    { id: 'delay', icon: Clock, label: 'Tiempo Espera', sub: 'Retraso de envío', color: 'stone' },
  ];
  const integrationNodes = [
    { id: 'webhook', icon: Settings, label: 'Webhook / API', sub: 'Conectar externa', color: 'cyan' },
    { id: 'handoff', icon: UserCheck, label: 'Agente Humano', sub: 'Pasar a asesor', color: 'secondary' },
  ];

  const renderNodeButton = (node: any) => (
    <button
      key={node.id}
      onClick={() => addNode(node.id)}
      className="group flex items-center gap-3 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-3 py-2.5 rounded-xl hover:border-primary-500/40 hover:shadow-lg hover:shadow-primary-500/5 transition-all text-left w-full"
    >
      <div className={`p-2 rounded-lg bg-${node.color}-50 dark:bg-${node.color}-500/10 text-${node.color}-600 dark:text-${node.color}-400 group-hover:scale-110 transition-transform flex-shrink-0`}>
        <node.icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-xs font-black text-slate-900 dark:text-white leading-none mb-0.5">{node.label}</h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{node.sub}</p>
      </div>
    </button>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 dark:bg-[#0f1117] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 bg-white dark:bg-[#11141b] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{flowData.name}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{flowData.category}</p>
          </div>

          <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 mx-2 hidden md:block" />

          <div
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 cursor-pointer"
            onClick={() => setIsFlowActive(!isFlowActive)}
          >
            <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isFlowActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isFlowActive ? 'left-6' : 'left-1'}`} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isFlowActive ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isFlowActive ? 'Flujo Activo' : 'Flujo Inactivo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={clearCanvas} className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-gray-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary-50 hover:text-secondary-600 hover:border-secondary-100 transition-all flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /><span>Limpiar</span>
          </button>
          <button onClick={() => setShowSimulator(true)} className="px-5 py-2.5 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-50 transition-all flex items-center gap-2">
            <Play className="w-3.5 h-3.5" /><span>Simular</span>
          </button>
          <button onClick={saveFlow} disabled={isSaving} className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
            {isSaving ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? '¡Guardado!' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative min-h-0">
          <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background variant={showGrid ? BackgroundVariant.Dots : undefined} gap={20} size={1} />

              {/* Floating canvas toolbar */}
              <div className="absolute top-6 left-6 z-10 flex gap-2">
                <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-30"><Undo2 className="w-4 h-4" /></button>
                  <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-30"><Redo2 className="w-4 h-4" /></button>
                </div>
                <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => zoomIn()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => zoomOut()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"><Maximize2 className="w-4 h-4 rotate-45 scale-75" /></button>
                  <button onClick={() => fitView()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"><Maximize2 className="w-4 h-4" /></button>
                </div>
                <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setShowMinimap(!showMinimap)} className={`p-2 rounded-xl transition-all ${showMinimap ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'text-gray-400'}`}><Layers className="w-4 h-4" /></button>
                  <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-xl transition-all ${showGrid ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'text-gray-400'}`}><Grid3X3 className="w-4 h-4" /></button>
                </div>
              </div>

              <Controls showInteractive={false} />
              {showMinimap && <MiniMap />}
            </ReactFlow>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white dark:bg-[#11141b] border-l border-gray-100 dark:border-gray-800 flex flex-col z-10 flex-shrink-0 overflow-hidden">
          {/* Tab switcher */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="flex bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => setActiveTab('nodos')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'nodos' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md border border-primary-100 dark:border-primary-500/20' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Plus className="w-3 h-3" /> Nodos
              </button>
              <button
                onClick={() => setActiveTab('propiedades')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'propiedades' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md border border-primary-100 dark:border-primary-500/20' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Settings className="w-3 h-3" /> Propiedades
              </button>
            </div>
          </div>

          {/* ─── NODOS TAB ─── */}
          {activeTab === 'nodos' && (
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 py-1.5">Canal de Chat</p>
              <div className="flex flex-col gap-1 mb-3">
                {chatNodes.map(renderNodeButton)}
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 py-1.5">Integraciones</p>
              <div className="flex flex-col gap-1">
                {integrationNodes.map(renderNodeButton)}
              </div>
            </div>
          )}

          {/* ─── PROPIEDADES TAB — no node selected ─── */}
          {activeTab === 'propiedades' && !selectedNode && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                <MousePointer2 className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Sin Selección</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Haz clic en un nodo del canvas para editarlo</p>
            </div>
          )}

          {/* ─── PROPIEDADES TAB — node selected ─── */}
          {activeTab === 'propiedades' && selectedNode && (
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-100 dark:border-primary-500/20">
                  {selectedNode.id}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase">{selectedNode.type}</span>
              </div>

              {/* Trigger */}
              {selectedNode.type === 'trigger' && (
                <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                  <label className="block text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3">Disparadores (Palabras Clave)</label>
                  <TriggerInput
                    triggers={currentTriggers || []}
                    onChange={handleTriggersChange}
                    placeholder="hola, ayuda, información..."
                    className="mb-2"
                  />
                  <p className="text-[9px] text-emerald-600/70 mt-2 font-bold italic">Estas palabras activarán el flujo cuando un usuario las envíe</p>
                </div>
              )}

              {/* Text */}
              {selectedNode.type === 'text' && (
                <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                  <label className="block text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-3">Contenido del Mensaje</label>
                  <textarea
                    value={selectedNode.data.text || ''}
                    onChange={(e) => updateNodeData({ text: e.target.value })}
                    onBlur={pushToHistory}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm outline-none resize-none h-48"
                    placeholder="Escribe aquí tu mensaje..."
                  />
                </div>
              )}

              {/* Media */}
              {selectedNode.type === 'media' && (
                <div className="p-5 bg-accent-50 dark:bg-accent-500/5 rounded-3xl border border-accent-100 dark:border-accent-500/20 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-accent-700 dark:text-accent-400 uppercase mb-2">URL del Archivo</label>
                    <input type="text" value={selectedNode.data.mediaUrl || ''} onChange={(e) => updateNodeData({ mediaUrl: e.target.value })} onBlur={pushToHistory} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-accent-200 rounded-2xl font-mono text-[10px]" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-accent-700 uppercase mb-2">Tipo</label>
                      <select value={selectedNode.data.mediaType || 'image'} onChange={(e) => { updateNodeData({ mediaType: e.target.value }); pushToHistory(); }} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-accent-200 rounded-xl text-[10px] font-black uppercase">
                        <option value="image">Imagen</option>
                        <option value="video">Vídeo</option>
                        <option value="audio">Audio</option>
                        <option value="document">Doc</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input type="checkbox" checked={!!selectedNode.data.isViewOnce} onChange={(e) => { updateNodeData({ isViewOnce: e.target.checked }); pushToHistory(); }} className="w-4 h-4 accent-accent-500" />
                      <label className="text-[9px] font-black text-accent-700 uppercase">1 Vista</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-accent-700 dark:text-accent-400 uppercase mb-2">Pie de foto (Caption)</label>
                    <textarea value={selectedNode.data.caption || ''} onChange={(e) => updateNodeData({ caption: e.target.value })} onBlur={pushToHistory} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-accent-200 rounded-2xl text-[10px] resize-none" rows={2} placeholder="Escribe algo..." />
                  </div>
                </div>
              )}

              {/* Interactive */}
              {selectedNode.type === 'interactive' && (
                <div className="p-5 bg-primary-50 dark:bg-primary-500/5 rounded-3xl border border-primary-100 dark:border-primary-500/20 space-y-3">
                  <label className="block text-[10px] font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest">Mensaje Interactivo</label>
                  <textarea value={selectedNode.data.bodyText || ''} onChange={(e) => updateNodeData({ bodyText: e.target.value })} onBlur={pushToHistory} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-primary-200 rounded-2xl text-sm resize-none" rows={3} placeholder="Describe las opciones..." />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-primary-600 uppercase">Botones (Máx 3)</label>
                      <span className="text-[9px] font-bold text-slate-400">{(selectedNode.data.buttons || []).length}/3</span>
                    </div>
                    {(selectedNode.data.buttons || []).map((btn: any, idx: number) => (
                      <div key={idx} className="flex gap-2 mb-2 group/btn">
                        <input type="text" value={btn.title} onChange={(e) => { const nb = [...(selectedNode.data.buttons || [])]; nb[idx] = { ...nb[idx], title: e.target.value }; updateNodeData({ buttons: nb }); }} onBlur={pushToHistory} className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-primary-200 rounded-xl text-[11px] font-bold" />
                        <button onClick={() => { updateNodeData({ buttons: selectedNode.data.buttons.filter((_: any, i: number) => i !== idx) }); pushToHistory(); }} className="p-2 opacity-0 group-hover/btn:opacity-100 text-secondary-500 hover:bg-secondary-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    {(!selectedNode.data.buttons || selectedNode.data.buttons.length < 3) && (
                      <button onClick={() => updateNodeData({ buttons: [...(selectedNode.data.buttons || []), { id: `btn-${Date.now()}`, title: 'Nuevo Botón' }] })} className="w-full py-3 border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-2xl text-[9px] font-black text-primary-600 uppercase hover:bg-primary-50 transition-all">
                        + Añadir Botón
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Capture */}
              {selectedNode.type === 'capture' && (
                <div className="p-5 bg-amber-50 dark:bg-amber-500/5 rounded-3xl border border-amber-100 dark:border-amber-500/20 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">Pregunta al Usuario</label>
                    <textarea value={selectedNode.data.question || ''} onChange={(e) => updateNodeData({ question: e.target.value })} onBlur={pushToHistory} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-amber-200 rounded-2xl text-sm resize-none" rows={3} placeholder="Ej: ¿Cuál es tu email?" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-amber-700 uppercase mb-2">Variable</label>
                      <input type="text" value={selectedNode.data.variableName || ''} onChange={(e) => updateNodeData({ variableName: e.target.value.replace(/\s+/g, '_').toLowerCase() })} onBlur={pushToHistory} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-amber-200 rounded-xl text-[10px] font-mono" placeholder="email_cli" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-amber-700 uppercase mb-2">Validación</label>
                      <select value={selectedNode.data.validationType || 'any'} onChange={(e) => { updateNodeData({ validationType: e.target.value }); pushToHistory(); }} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-amber-200 rounded-xl text-[10px] font-black uppercase">
                        <option value="any">Texto</option>
                        <option value="email">Email</option>
                        <option value="number">Número</option>
                        <option value="phone">Teléfono</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Delay */}
              {selectedNode.type === 'delay' && (
                <div className="p-5 bg-stone-50 dark:bg-stone-500/5 rounded-3xl border border-stone-200 dark:border-stone-800">
                  <label className="block text-[10px] font-black text-stone-700 dark:text-stone-400 uppercase tracking-widest mb-4">Tiempo de Espera</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="60" value={selectedNode.data.delaySeconds || 3} onChange={(e) => updateNodeData({ delaySeconds: parseInt(e.target.value) })} onBlur={pushToHistory} className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-600" />
                    <span className="text-2xl font-black text-stone-600 dark:text-stone-400 w-12">{selectedNode.data.delaySeconds || 3}s</span>
                  </div>
                  <p className="text-[9px] text-stone-400 mt-4 font-bold italic">Simula escritura humana antes del siguiente mensaje.</p>
                </div>
              )}

              {/* Webhook */}
              {selectedNode.type === 'webhook' && (
                <div className="p-5 bg-cyan-50 dark:bg-cyan-500/5 rounded-3xl border border-cyan-100 dark:border-cyan-500/20 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest mb-2">Endpoint URL</label>
                    <input type="text" value={selectedNode.data.url || ''} onChange={(e) => updateNodeData({ url: e.target.value })} onBlur={pushToHistory} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-cyan-200 rounded-2xl font-mono text-[10px]" placeholder="https://tu-api.com/..." />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-cyan-700 uppercase mb-2">Método</label>
                    <select value={selectedNode.data.method || 'POST'} onChange={(e) => { updateNodeData({ method: e.target.value }); pushToHistory(); }} className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-cyan-200 rounded-xl text-[10px] font-black">
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Handoff */}
              {selectedNode.type === 'handoff' && (
                <div className="p-5 bg-secondary-50 dark:bg-secondary-500/5 rounded-3xl border border-secondary-100 dark:border-secondary-500/20 text-center">
                  <div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Traspaso a Agente</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 mb-5">Pausa la automatización y notifica a un humano.</p>
                  <div className="text-left">
                    <label className="block text-[9px] font-black text-secondary-700 uppercase mb-2">Mensaje de Despedida</label>
                    <textarea value={selectedNode.data.message || ''} onChange={(e) => updateNodeData({ message: e.target.value })} onBlur={pushToHistory} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-secondary-200 rounded-2xl text-[10px] resize-none" rows={2} placeholder="Un momento, te paso con un asesor..." />
                  </div>
                </div>
              )}

              {/* Delete node */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase">X:{Math.round(selectedNode.position.x)} Y:{Math.round(selectedNode.position.y)}</span>
                <button onClick={() => {
                  if (window.confirm('¿Borrar este nodo?')) {
                    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                    setSelectedNode(null);
                    pushToHistory();
                  }
                }} className="p-2 text-secondary-500 hover:bg-secondary-50 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSimulator && (
        <FlowSimulator nodes={nodes} edges={edges} onClose={() => setShowSimulator(false)} />
      )}
    </div>
  );
};
