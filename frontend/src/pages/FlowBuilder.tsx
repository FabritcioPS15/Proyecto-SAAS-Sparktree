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
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from '../components/flow/TriggerNode';
import { TextNode } from '../components/flow/TextNode';
import { InteractiveNode } from '../components/flow/InteractiveNode';
import { MediaNode } from '../components/flow/MediaNode';
import { CaptureNode } from '../components/flow/CaptureNode';
import { WebhookNode } from '../components/flow/WebhookNode';
import { HandoffNode } from '../components/flow/HandoffNode';
import { DelayNode } from '../components/flow/DelayNode';
import {
  Save, Bot, Play, Zap, Settings, Layers, Grid3X3, Sparkles,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, X, Plus
} from 'lucide-react';
import { FlowSimulator } from '../components/flow/FlowSimulator';

import { saveFlows, getFlows } from '../services/api';

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

// Fallback template defaults
const defaultNodes = [
  { id: '1', type: 'trigger', position: { x: 250, y: 100 }, data: { keywords: ['hola'] } },
  { id: '2', type: 'text', position: { x: 250, y: 300 }, data: { text: '¡Hola! Bienvenido.' } }
];
const defaultEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const FlowBuilderContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<{ nodes: any[], edges: any[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('Nuevo Flujo');
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'nodes' | 'properties'>('nodes');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  // Handle history tracking
  const takeSnapshot = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
      // Keep history manageable
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [nodes, edges, historyIndex]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
    setActiveTab('properties');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setActiveTab('nodes');
  }, []);

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;

    // Save snapshot before changes
    takeSnapshot();

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = { ...node, data: { ...node.data, ...newData } };
          setSelectedNode(updatedNode); // Keep sync
          return updatedNode;
        }
        return node;
      })
    );
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const clearCanvas = () => {
    takeSnapshot();
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setSelectedNode(null);
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let defaultData: any = {};
      switch (type) {
        case 'trigger': defaultData = { keywords: ['nueva-palabra'] }; break;
        case 'text': defaultData = { text: 'Nuevo mensaje' }; break;
        case 'interactive': defaultData = { bodyText: 'Nueva pregunta', buttons: [] }; break;
        case 'media': defaultData = { mediaUrl: '' }; break;
        case 'capture': defaultData = { question: '¿Cuál es tu correo?', variableName: 'email' }; break;
        case 'webhook': defaultData = { url: '', method: 'POST' }; break;
        case 'handoff': defaultData = {}; break;
        case 'delay': defaultData = { delaySeconds: 3 }; break;
      }

      const newNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: defaultData,
      };

      takeSnapshot();
      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
      setActiveTab('properties');
    },
    [screenToFlowPosition, setNodes, takeSnapshot],
  );

  useEffect(() => {
    getFlows().then((data) => {
      if (data && data.length > 0) {
        setNodes(data[0].nodes || defaultNodes);
        setEdges(data[0].edges || defaultEdges);
        setFlowId(data[0].id || data[0]._id);
        setFlowName(data[0].name || 'Nuevo Flujo');
        setIsActive(data[0].is_active !== false);

        // Initial history snapshot
        setHistory([{ nodes: data[0].nodes || defaultNodes, edges: data[0].edges || defaultEdges }]);
        setHistoryIndex(0);
      }
    }).catch(err => console.error(err));
  }, []); // Only once on mount

  const onConnect = useCallback(
    (params: any) => {
      takeSnapshot();
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, takeSnapshot],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: flowName,
        is_active: isActive,
        nodes,
        edges
      };
      const result = await saveFlows(payload, flowId || undefined);
      if (result && (result.id || result._id)) {
        setFlowId(result.id || result._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 absolute inset-0 p-4 md:p-6 pb-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2">
        <div className="flex-1 w-full max-w-xl">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="text-3xl font-extrabold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 outline-none p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors w-full"
              placeholder="Nombre del Flujo"
            />
          </div>
          <div className="flex items-center gap-3 mt-3 px-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold tracking-wide uppercase ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
              {isActive ? 'Flujo Activo' : 'Flujo Inactivo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toolbar */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
            <button onClick={() => setShowMinimap(!showMinimap)} className={`p-2 rounded-lg transition-colors ${showMinimap ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} title="Minimapa">
              <Layers className="w-4 h-4" />
            </button>
            <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} title="Cuadrícula">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="Deshacer">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="Rehacer">
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button onClick={() => fitView({ padding: 0.2 })} className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" title="Ajustar vista">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={() => zoomIn()} className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" title="Acercar">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => zoomOut()} className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" title="Alejar">
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <button onClick={clearCanvas} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
            <X className="w-4 h-4" />
            Limpiar
          </button>
          <button onClick={() => setShowSimulator(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Play className="w-4 h-4 text-emerald-500" />
            Simular
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-t-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex -mx-4 md:-mx-6 px-0 mb-0">
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50/50 dark:bg-gray-900/50"
          >
            <Controls className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden" />
            {showMinimap && (
              <MiniMap
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
                maskColor="rgba(0,0,0,0.1)"
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'trigger': return '#10B981';
                    case 'text': return '#3B82F6';
                    case 'interactive': return '#8B5CF6';
                    case 'media': return '#EC4899';
                    case 'capture': return '#F59E0B';
                    case 'webhook': return '#06B6D4';
                    case 'handoff': return '#EF4444';
                    case 'delay': return '#6B7280';
                    default: return '#9CA3AF';
                  }
                }}
              />
            )}
            <Background variant={showGrid ? BackgroundVariant.Dots : undefined} gap={16} size={1} color="#9CA3AF" />
          </ReactFlow>
        </div>

        {/* Sidebar Tabs */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 shrink-0">
          <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${activeTab === 'nodes' ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}
            >
              Nodos
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${activeTab === 'properties' ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}
            >
              Propiedades
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'nodes' ? (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Selecciona un bloque</h3>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'trigger', icon: Zap, label: 'Disparador', sub: 'Palabra clave', color: 'indigo' },
                    { type: 'text', icon: Bot, label: 'Mensaje', sub: 'Texto simple', color: 'blue' },
                    { type: 'interactive', icon: Grid3X3, label: 'Interactivo', sub: 'Botones', color: 'purple' },
                    { type: 'media', icon: Layers, label: 'Multimedia', sub: 'Imagen/Video', color: 'pink' },
                    { type: 'capture', icon: Settings, label: 'Capturar', sub: 'Datos', color: 'amber' },
                    { type: 'webhook', icon: Zap, label: 'Webhook', sub: 'API', color: 'cyan' },
                    { type: 'delay', icon: Undo2, label: 'Retraso', sub: 'Esperar', color: 'emerald' },
                    { type: 'handoff', icon: Bot, label: 'Agente', sub: 'Humano', color: 'rose' },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className={`group p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-grab hover:shadow-xl hover:border-${item.color}-300 hover:-translate-y-1 transition-all duration-300`}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', item.type);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      draggable
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-500/20 text-${item.color}-600 dark:text-${item.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{item.sub}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {!selectedNode ? (
                  <div className="text-center py-20 px-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 italic">Selecciona un bloque en el lienzo para editar sus propiedades</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">ID: {selectedNode.id}</span>
                      <span className="text-xs font-black uppercase text-indigo-600">{selectedNode.type}</span>
                    </div>

                    {/* Trigger Editor */}
                    {selectedNode.type === 'trigger' && (
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Palabras Clave</label>
                        <textarea
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none h-32"
                          value={selectedNode.data.keywordString !== undefined ? selectedNode.data.keywordString : (selectedNode.data.keywords?.join(', ') || '')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const vals = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
                            updateNodeData({ keywords: vals, keywordString: raw });
                          }}
                          placeholder="Hola, Precio, Ayuda..."
                        />
                        <p className="text-[10px] text-gray-400 italic">Separa múltiples palabras por comas.</p>
                      </div>
                    )}

                    {/* Text Editor */}
                    {selectedNode.type === 'text' && (
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Contenido del Mensaje</label>
                        <textarea
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-40"
                          value={selectedNode.data.text || ''}
                          onChange={(e) => updateNodeData({ text: e.target.value })}
                          placeholder="Escribe la respuesta del bot..."
                        />
                      </div>
                    )}

                    {/* Interactive Editor */}
                    {selectedNode.type === 'interactive' && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Cuerpo del Mensaje</label>
                          <textarea
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-24"
                            value={selectedNode.data.bodyText || ''}
                            onChange={(e) => updateNodeData({ bodyText: e.target.value })}
                            placeholder="Ej: ¿Qué prefieres?"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Botones (Máx 3)</label>
                            <button
                              onClick={() => {
                                const currentBtns = selectedNode.data.buttons || [];
                                if (currentBtns.length >= 3) return;
                                updateNodeData({ buttons: [...currentBtns, { id: `btn_${Date.now()}`, title: 'Opción' }] });
                              }}
                              disabled={(selectedNode.data.buttons?.length || 0) >= 3}
                              className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 disabled:opacity-30 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {selectedNode.data.buttons?.map((btn: any, index: number) => (
                              <div key={btn.id} className="flex gap-2">
                                <input
                                  type="text"
                                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-500"
                                  value={btn.title}
                                  onChange={(e) => {
                                    const newBtns = [...selectedNode.data.buttons];
                                    newBtns[index].title = e.target.value;
                                    updateNodeData({ buttons: newBtns });
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newBtns = selectedNode.data.buttons.filter((_: any, i: number) => i !== index);
                                    updateNodeData({ buttons: newBtns });
                                  }}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delay Editor */}
                    {selectedNode.type === 'delay' && (
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Segundos de espera</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          value={selectedNode.data.delaySeconds || 3}
                          onChange={(e) => updateNodeData({ delaySeconds: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSimulator && (
        <FlowSimulator
          nodes={nodes}
          edges={edges}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
};

export const FlowBuilder = () => {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent />
    </ReactFlowProvider>
  );
};
