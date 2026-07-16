import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  reconnectEdge,
  BackgroundVariant,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { useMemo } from 'react';
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
import { TriggerInput } from './TriggerInput';
import { Dropdown } from '../../../components/ui/Dropdown';
import {
  Save, Bot, Play, Zap, Settings, Layers,
  Trash2,
  ChevronRight, Plus, BadgeInfo, HelpCircle
} from 'lucide-react';
import {
  HiMiniPlus,
  HiMiniSquare3Stack3D,
  HiMiniChatBubbleBottomCenterText,
  HiMiniVideoCamera,
  HiMiniVariable,
  HiMiniClock,
  HiMiniGlobeAlt,
  HiMiniUserPlus,
  HiMiniTrash,
  HiMiniBolt,
  HiMiniStar
} from "react-icons/hi2";
import { saveFlows, getActiveConnectionsForFlow } from '../../../services/api';



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
    matchingStrategy?: 'strict' | 'flexible';
    reactivationTime?: number;
  };
  onBack?: () => void;
}

export const FlowBuilderContent = ({ flowData, onBack }: FlowBuilderContentProps) => {
  const [nodes, setNodes] = useState(flowData.nodes || []);
  const [edges, setEdges] = useState(flowData.edges || []);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    text: TextNode,
    interactive: InteractiveNode,
    media: MediaNode,
    capture: CaptureNode,
    webhook: WebhookNode,
    handoff: HandoffNode,
    delay: DelayNode,
  }), []);

  const [currentTriggers, setCurrentTriggers] = useState(flowData.triggers || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(flowData.status === 'active');
  const [history, setHistory] = useState([{ nodes: flowData.nodes || [], edges: flowData.edges || [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodos' | 'propiedades'>('nodos');
  const [matchingStrategy, setMatchingStrategy] = useState<'strict' | 'flexible'>(flowData.matchingStrategy || 'strict');
  const [flowName, setFlowName] = useState(flowData.name || '');
  const [flowCategory, setFlowCategory] = useState(flowData.category || 'other');
  const [reactivationTime, setReactivationTime] = useState<number>(flowData.reactivationTime || 30);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const flowId = flowData.id || flowData._id;
    if (flowId) {
      getActiveConnectionsForFlow(flowId)
        .then(setActiveConnections)
        .catch(err => console.error('Error fetching active connections:', err));
    }
  }, [flowData.id, flowData._id]);

  const incomingEdges = useMemo(() =>
    edges.filter(e => e.target === selectedNodeId && nodes.some(n => n.id === e.source)),
    [edges, nodes, selectedNodeId]
  );

  const outgoingEdges = useMemo(() =>
    edges.filter(e => e.source === selectedNodeId && nodes.some(n => n.id === e.target)),
    [edges, nodes, selectedNodeId]
  );

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
    setActiveTab('propiedades');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onNodesDelete = useCallback((deleted: any[]) => {
    const deletedIds = new Set(deleted.map((n) => n.id));
    setEdges((eds) => eds.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)));
  }, []);

  const updateNodeData = useCallback((newData: any) => {
    if (!selectedNodeId) return;

    setNodes((nds) => nds.map((n) =>
      n.id === selectedNodeId
        ? { ...n, data: { ...n.data, ...newData, _updatedAt: Date.now() }, style: { ...n.style, height: 'auto' } }
        : n
    ));
  }, [selectedNodeId]);

  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (isSaving) return;

    const timer = setTimeout(() => {
      const currentData = {
        nodes,
        edges,
        flowName,
        flowCategory,
        currentTriggers,
        matchingStrategy,
        reactivationTime,
        isFlowActive
      };
      const currentDataString = JSON.stringify(currentData);

      if (lastSavedRef.current && lastSavedRef.current !== currentDataString) {
        saveFlow(false);
      }
      lastSavedRef.current = currentDataString;
    }, 5000);

    return () => clearTimeout(timer);
  }, [nodes, edges, flowName, flowCategory, currentTriggers, matchingStrategy, reactivationTime, isFlowActive, isSaving]);

  const pushToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
  };

  const clearCanvas = () => {
    if (window.confirm('¿Limpiar todo el flow?')) {
      setNodes([]);
      setEdges([]);
      pushToHistory();
    }
  };

  const onReconnect = useCallback((oldEdge: any, newConnection: any) => {
    pushToHistory();
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, [setEdges]);

  const onReconnectStart = useCallback(() => { }, []);
  const onReconnectEnd = useCallback((_: any, connection: any) => {
    if (!connection.handleId) {
      setEdges((els) => els.filter((e) => e.id !== connection.edgeId));
      pushToHistory();
    }
  }, [setEdges]);

  const onConnect = useCallback((params: any) => {
    pushToHistory();
    setEdges((eds) => addEdge(params, eds));
  }, [nodes, edges]);

  const handleTriggersChange = (triggers: string[]) => {
    setCurrentTriggers(triggers);
    setNodes((nds) => nds.map((n) => n.type === 'trigger' ? { ...n, data: { ...n.data, keywords: triggers } } : n));
  };

  const saveFlow = async (showFeedback = true) => {
    setIsSaving(true);
    try {
      // PERSISTENCE STRATEGY: Store config in the Trigger node's data to avoid DB schema issues
      const updatedNodes = nodes.map(n =>
        n.type === 'trigger'
          ? { ...n, data: { ...n.data, matchingStrategy, reactivationTime, keywords: currentTriggers } }
          : n
      );

      await saveFlows({
        name: flowName,
        nodes: updatedNodes,
        edges,
        triggers: currentTriggers,
        status: isFlowActive ? 'active' : 'draft',
        category: flowCategory,
        // Send these too just in case, but rely on nodes for persistence
        matchingStrategy,
        reactivationTime
      }, flowData.id || flowData._id);

      setNodes(updatedNodes);
      flowData.triggers = currentTriggers;

      if (showFeedback) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { label: type, text: '' },
    };
    setNodes((nds) => nds.concat(newNode));
    pushToHistory();
  }, [screenToFlowPosition]);

  const insertFormatting = (id: string, type: string, nodeType: string) => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let formattedText = '';

    switch (type) {
      case 'bold': formattedText = `*${selectedText}*`; break;
      case 'italic': formattedText = `_${selectedText}_`; break;
      case 'strike': formattedText = `~${selectedText}~`; break;
      case 'code': formattedText = `\`\`\`${selectedText}\`\`\``; break;
      default: formattedText = selectedText;
    }

    const newValue = text.substring(0, start) + formattedText + text.substring(end);

    if (nodeType === 'text') {
      updateNodeData({ text: newValue });
    } else if (nodeType === 'interactive') {
      updateNodeData({ bodyText: newValue });
    } else if (nodeType === 'capture') {
      updateNodeData({ question: newValue });
    }
  };

  const chatNodes = [
    { id: 'trigger', label: 'Disparador', sub: 'Palabras Clave', icon: HiMiniBolt, helpText: 'Inicia el flujo cuando el usuario envía un mensaje que coincide con las palabras clave.' },
    { id: 'text', label: 'Texto', sub: 'Mensaje Simple', icon: HiMiniChatBubbleBottomCenterText, helpText: 'Envía un mensaje de texto simple al usuario.' },
    { id: 'interactive', label: 'Botones', sub: 'Opciones Rápidas', icon: HiMiniSquare3Stack3D, helpText: 'Envía un mensaje con botones interactivos para que el usuario elija una opción.' },
    { id: 'media', label: 'Media', sub: 'Imagen / Video', icon: HiMiniVideoCamera, helpText: 'Envía una imagen, video o documento adjunto.' },
  ];

  const integrationNodes = [
    { id: 'capture', label: 'Captura', sub: 'Pedir Dato', icon: HiMiniVariable, helpText: 'Hace una pregunta y guarda la respuesta del usuario en una variable (ej. @nombre).' },
    { id: 'delay', label: 'Espera', sub: 'Escribiendo...', icon: HiMiniClock, helpText: 'Pausa el flujo temporalmente simulando que el bot está escribiendo o esperando.' },
    { id: 'webhook', label: 'Webhook', sub: 'API Externa', icon: HiMiniGlobeAlt, helpText: 'Envía datos a un sistema externo o API de tu empresa.' },
    { id: 'handoff', label: 'Humano', sub: 'Transferir', icon: HiMiniUserPlus, helpText: 'Detiene el bot y transfiere la conversación a un agente humano.' },
  ];

  const renderNodeButton = (node: any) => (
    <div key={node.id} className="relative">
      <button
        draggable
        onDragStart={(e) => e.dataTransfer.setData('application/reactflow', node.id)}
        onClick={() => {
          const position = { x: 250, y: 250 };
          const newNode = {
            id: `node_${Date.now()}`,
            type: node.id,
            position,
            data: { label: node.id, text: '' },
          };
          setNodes((nds) => nds.concat(newNode));
          pushToHistory();
        }}
        className="w-full flex flex-col items-center justify-center p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-sm hover:border-accent-500 hover:shadow-xl hover:shadow-accent-500/5 transition-all text-center group"
      >
        <div className="p-3 bg-slate-900 rounded-sm text-accent-500 mb-3 group-hover:scale-110 transition-transform shadow-lg relative">
          <node.icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest">{node.label}</h3>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{node.sub}</p>
        </div>
      </button>

      {/* Ícono de Ayuda y su Tooltip (solo activo al hacer hover en el ícono) */}
      <div className="absolute top-2 right-2 group/help z-50">
        <div className="text-slate-300 dark:text-slate-600 hover:text-accent-500 cursor-help transition-colors p-1">
          <HelpCircle className="w-3.5 h-3.5" />
        </div>

        {/* Tooltip de Información */}
        <div className="absolute right-0 bottom-full mb-1 w-48 p-3 bg-slate-900 dark:bg-slate-800 text-left rounded-sm shadow-xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all pointer-events-none">
          <h4 className="text-[10px] font-black uppercase text-accent-400 tracking-widest mb-1">{node.label}</h4>
          <p className="text-[9px] font-medium text-slate-300 leading-relaxed">{node.helpText}</p>
          <div className="absolute right-2 top-full border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 dark:bg-[#252525] overflow-hidden">
      <style>{`
        /* Mejorar la facilidad para conectar los nodos */
        .react-flow__handle {
          width: 14px;
          height: 14px;
          background-color: #ffffffff; /* accent-500 */
          border: 2px solid #35ec10ff;
          transition: all 0.2s ease;
          border-radius: 50%; /* Mantener redondo para indicar punto de conexión */
        }
        .react-flow__handle:hover, .react-flow__handle-connecting {
          width: 18px;
          height: 18px;
          background-color: rgba(255, 255, 255, 1); /* accent-600 */
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }
        /* Aumentar el area clickeable invisible del handle */
        .react-flow__handle::after {
          content: "";
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
        }
      `}</style>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-500/5 blur-[120px] rounded-full pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 blur-[100px] rounded-full pointer-events-none -ml-20 -mb-20" />

      {/* Header - Fixed at Top */}
      <div className="h-20 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 z-50 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-5">
          {onBack && (
            <button
              onClick={onBack}
              className="group p-3 rounded-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-slate-600 dark:text-slate-300 transition-colors" />
            </button>
          )}

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-700 rounded-sm shadow-lg shadow-accent-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[200px] md:max-w-[300px]" title={flowName}>
                {flowName || 'Sin Nombre'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flowCategory}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isFlowActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isFlowActive ? 'En Línea' : 'Desconectado'}
                </span>
                {activeConnections.length > 0 && (
                  <>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center -space-x-2">
                      {activeConnections.map((conn) => (
                        <div
                          key={conn.id}
                          className="w-5 h-5 rounded-full bg-accent-500 border-2 border-white dark:border-dark-card flex items-center justify-center text-[8px] font-black text-white cursor-help shadow-sm"
                          title={`Bot: ${conn.display_name} (${conn.phone_number})`}
                        >
                          {conn.display_name?.charAt(0).toUpperCase() || 'B'}
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-accent-500 uppercase tracking-tighter">
                      {activeConnections.length} {activeConnections.length === 1 ? 'Bot' : 'Bots'} Activos
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden md:block" />

          {/* Activity Toggle */}
          <button
            onClick={() => setIsFlowActive(!isFlowActive)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-sm transition-all border ${isFlowActive
              ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
              : 'bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-700'
              }`}
          >
            <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${isFlowActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isFlowActive ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isFlowActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
              {isFlowActive ? 'Activo' : 'Borrador'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSimulator(true)}
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-accent-500" />
            <span>Simular</span>
          </button>

          <button
            onClick={() => saveFlow()}
            disabled={isSaving}
            className={`px-10 py-3 rounded-sm font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ${saveSuccess
              ? 'bg-emerald-500 text-white animate-pulse'
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              }`}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? '¡Cambios Guardados!' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodesDelete={onNodesDelete}
            fitView
          >
            <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-sm overflow-hidden shadow-2xl" />
          </ReactFlow>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-white dark:bg-dark-card border-y border-l border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-l-md shadow-md z-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Right Toolbar */}
        <div className={`bg-white dark:bg-dark-card border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 shadow-2xl shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-96' : 'w-0 border-l-0'}`}>
          <div className="w-96 flex flex-col h-full">
            <div className="p-2 flex gap-1 bg-slate-100/80 dark:bg-slate-800/80 mx-5 mt-6 rounded-sm border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
              <button
                onClick={() => setActiveTab('nodos')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'nodos' ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Layers className={`w-3.5 h-3.5 ${activeTab === 'nodos' ? 'text-accent-500' : ''}`} /> Nodos
              </button>
              <button
                onClick={() => setActiveTab('propiedades')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'propiedades' ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Settings className={`w-3.5 h-3.5 ${activeTab === 'propiedades' ? 'text-accent-500' : ''}`} /> Propiedades
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
              {activeTab === 'nodos' && (
                <div className="space-y-8 mt-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">Disparadores</label>
                    <div className="grid grid-cols-2 gap-3">{chatNodes.map(renderNodeButton)}</div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">Integraciones</label>
                    <div className="grid grid-cols-2 gap-3">{integrationNodes.map(renderNodeButton)}</div>
                  </div>
                </div>
              )}

              {activeTab === 'propiedades' && !selectedNode && (
                <div className="space-y-8 text-slate-900 dark:text-white">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Nombre</label>
                    <input value={flowName} onChange={(e) => setFlowName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-sm text-sm font-bold outline-none border border-transparent focus:border-accent-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Categoría</label>
                    <Dropdown
                      value={flowCategory}
                      onChange={(v) => setFlowCategory(v)}
                      options={[
                        { value: 'sales', label: 'Ventas' },
                        { value: 'support', label: 'Soporte' },
                        { value: 'marketing', label: 'Marketing' },
                        { value: 'onboarding', label: 'Onboarding' },
                        { value: 'other', label: 'Otro' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      Modo del Bot <BadgeInfo className="w-3 h-3" />
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          id: 'strict',
                          label: 'Modo Estricto',
                          sub: 'Ideal para tus números personales. El bot solo se activa si el mensaje es idéntico a la(s) palabra(s) clave(s) .',
                          color: 'primary'
                        },
                        {
                          id: 'flexible',
                          label: 'Modo Inteligente',
                          sub: 'El bot detecta palabras clave dentro de oraciones largas. Más sensible y proactivo.',
                          color: 'amber'
                        }
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setMatchingStrategy(opt.id as any)} className={`p-5 rounded-sm border-2 text-left transition-all ${matchingStrategy === opt.id ? `border-${opt.color}-500 bg-${opt.color}-50 dark:bg-${opt.color}-900/10` : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                          <h5 className={`text-[11px] font-black uppercase ${matchingStrategy === opt.id ? `text-${opt.color}-600` : 'text-slate-500'}`}>{opt.label}</h5>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recarga: {reactivationTime}m</label>
                    </div>
                    <input type="range" min="1" max="120" value={reactivationTime} onChange={(e) => setReactivationTime(parseInt(e.target.value))} className="w-full accent-accent-600" />
                  </div>

                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Zona de Peligro</h4>
                    <button
                      onClick={clearCanvas}
                      className="w-full py-4 bg-rose-50/50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-500/10 group"
                    >
                      <HiMiniTrash className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Limpiar Lienzo Completo
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'propiedades' && selectedNode && (
                <div className="space-y-8 text-slate-900 dark:text-white pb-20">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 -mx-6 px-6 py-4 border-y border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent-50 dark:bg-accent-900/20 rounded-sm">
                        {selectedNode.type === 'trigger' && <Zap className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'text' && <HiMiniChatBubbleBottomCenterText className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'interactive' && <HiMiniSquare3Stack3D className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'media' && <HiMiniVideoCamera className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'capture' && <HiMiniVariable className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'delay' && <HiMiniClock className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'webhook' && <HiMiniGlobeAlt className="w-4 h-4 text-accent-600" />}
                        {selectedNode.type === 'handoff' && <HiMiniUserPlus className="w-4 h-4 text-accent-600" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest">{selectedNode.type}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Configuración del Nodo</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveFlow()} className="p-2.5 bg-emerald-500 text-white rounded-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"><Save className="w-4 h-4" /></button>
                      <button onClick={() => {
                        const idToRemove = selectedNodeId;
                        setNodes((nds) => nds.filter((n) => n.id !== idToRemove));
                        setEdges((eds) => eds.filter((e) => e.source !== idToRemove && e.target !== idToRemove));
                        setSelectedNodeId(null);
                        pushToHistory();
                      }} className="p-2.5 bg-rose-50 text-rose-500 rounded-sm hover:bg-rose-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="bg-accent-50 dark:bg-accent-500/5 p-5 rounded-sm border border-accent-100 dark:border-accent-500/10 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiMiniStar className={`w-4 h-4 ${selectedNode.data.isConversionNode ? 'text-accent-500 fill-accent-500' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Cliente Potencial</span>
                      </div>
                      <button
                        onClick={() => updateNodeData({ isConversionNode: !selectedNode.data.isConversionNode })}
                        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${selectedNode.data.isConversionNode ? 'bg-accent-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${selectedNode.data.isConversionNode ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    {selectedNode.data.isConversionNode && (
                      <p className="mt-2 text-[9px] font-bold text-accent-600 uppercase leading-tight animate-in fade-in slide-in-from-top-1">
                        Si el usuario llega a este nodo, será marcado como cliente potencial.
                      </p>
                    )}
                  </div>


                  {selectedNode.type === 'trigger' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="bg-accent-50 dark:bg-accent-500/5 p-5 rounded-sm border border-accent-100 dark:border-accent-500/10">
                        <label className="text-[10px] font-black uppercase text-accent-600 tracking-widest mb-4 block">Palabras Clave de Activación</label>
                        <TriggerInput triggers={currentTriggers} onChange={handleTriggersChange} />
                        <p className="mt-3 text-[9px] font-bold text-accent-600/60 leading-relaxed uppercase">El bot responderá automáticamente cuando el usuario escriba estas palabras.</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'text' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Mensaje de Respuesta</label>
                        <div className="relative group">
                          <textarea
                            id="node-text"
                            value={selectedNode.data.text || ''}
                            onChange={(e) => updateNodeData({ text: e.target.value })}
                            placeholder="Escribe el mensaje que enviará el bot..."
                            className="w-full p-8 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-base font-medium resize-none outline-none border-2 border-transparent focus:border-accent-500 transition-all min-h-[400px] shadow-inner"
                          />
                          <div className="absolute bottom-6 right-8 flex gap-3">
                            <button onClick={() => insertFormatting('node-text', 'bold', 'text')} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-sm shadow-lg text-lg font-black hover:scale-110 transition-all border border-slate-100 dark:border-slate-600 text-slate-900 dark:text-white">B</button>
                            <button onClick={() => insertFormatting('node-text', 'italic', 'text')} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-sm shadow-lg text-lg italic hover:scale-110 transition-all border border-slate-100 dark:border-slate-600 text-slate-900 dark:text-white">I</button>
                          </div>
                        </div>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center italic">Puedes usar {'{{nombre}}'} para personalizar el mensaje.</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'interactive' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Cuerpo del Mensaje</label>
                        <textarea id="node-interactive" value={selectedNode.data.bodyText || ''} onChange={(e) => updateNodeData({ bodyText: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-sm outline-none border-2 border-transparent focus:border-accent-500 transition-all font-medium" rows={4} />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block flex justify-between items-center">
                          Botones de Respuesta
                          <span className="text-accent-500">{(selectedNode.data.buttons || []).length}/10</span>
                        </label>
                        <div className="space-y-3">
                          {selectedNode.data.buttons?.map((btn: any, idx: number) => (
                            <div key={btn.id || `sidebar-btn-${idx}`} className="group/btn relative flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-accent-500 rounded-sm transition-all shadow-sm">
                              <div className="flex-1 relative">
                                <input
                                  value={btn.text || ''}
                                  onChange={(e) => {
                                    const newBtns = (selectedNode.data.buttons || []).map((b: any, bIdx: number) => {
                                      if (bIdx === idx) return { ...b, text: e.target.value };
                                      return b;
                                    });
                                    updateNodeData({ buttons: newBtns });
                                  }}
                                  placeholder={`Opción ${idx + 1}`}
                                  className="w-full px-4 py-2.5 bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newBtns = selectedNode.data.buttons.filter((_: any, i: number) => i !== idx);
                                  updateNodeData({ buttons: newBtns });
                                }}
                                className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-sm transition-all shrink-0"
                                title="Eliminar botón"
                              >
                                <HiMiniTrash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(selectedNode.data.buttons || []).length < 10 && (
                            <button
                              onClick={() => updateNodeData({ buttons: [...(selectedNode.data.buttons || []), { id: `btn_${Date.now()}`, text: 'Nuevo Botón' }] })}
                              className="w-full py-4 mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-sm text-[10px] font-black uppercase text-slate-400 hover:border-primary-400 hover:text-accent-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Añadir Opción
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'media' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">URL del Archivo</label>
                        <input
                          type="text"
                          value={selectedNode.data.mediaUrl || ''}
                          onChange={(e) => updateNodeData({ mediaUrl: e.target.value })}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-xs font-bold outline-none border-2 border-transparent focus:border-accent-500 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Pie de Foto (Opcional)</label>
                        <input
                          type="text"
                          value={selectedNode.data.caption || ''}
                          onChange={(e) => updateNodeData({ caption: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'capture' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Pregunta al Usuario</label>
                        <textarea
                          value={selectedNode.data.question || ''}
                          onChange={(e) => updateNodeData({ question: e.target.value })}
                          className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-sm outline-none border-2 border-transparent focus:border-accent-500 transition-all min-h-[120px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Variable de Guardado</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-500 font-black">@</span>
                          <input
                            type="text"
                            value={selectedNode.data.variableName || ''}
                            onChange={(e) => updateNodeData({ variableName: e.target.value })}
                            placeholder="nombre_usuario"
                            className="w-full pl-8 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-xs font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'delay' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tiempo de Espera</label>
                          <span className="text-xl font-black text-accent-600">
                            {selectedNode.data.delaySeconds >= 60
                              ? `${(selectedNode.data.delaySeconds / 60).toFixed(1)}m`
                              : `${selectedNode.data.delaySeconds || 3}s`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="1800"
                          step={selectedNode.data.delaySeconds >= 60 ? 30 : 1}
                          value={selectedNode.data.delaySeconds || 3}
                          onChange={(e) => updateNodeData({ delaySeconds: parseInt(e.target.value) })}
                          className="w-full accent-accent-600 cursor-pointer"
                        />
                        <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400 uppercase">
                          <span>1 segundo</span>
                          <span>30 minutos</span>
                        </div>
                        <p className="mt-4 text-[9px] font-medium text-slate-400 uppercase tracking-tight text-center italic">
                          El bot pausará el flujo durante este tiempo antes de continuar al siguiente nodo.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'webhook' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 font-inter">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Punto de Enlace (URL)</label>
                        <input
                          type="text"
                          value={selectedNode.data.url || ''}
                          onChange={(e) => updateNodeData({ url: e.target.value })}
                          placeholder="https://api.tuempresa.com/webhook"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-[11px] font-bold outline-none border-2 border-transparent focus:border-accent-500 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Método HTTP</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['POST', 'GET'].map(method => (
                            <button
                              key={method}
                              onClick={() => updateNodeData({ method })}
                              className={`py-3 rounded-sm text-[10px] font-black transition-all ${selectedNode.data.method === method ? 'bg-accent-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'handoff' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="bg-accent-50 dark:bg-accent-500/5 p-6 rounded-sm border border-accent-100 dark:border-accent-500/10 text-center mb-6">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-sm shadow-lg flex items-center justify-center mx-auto mb-4 text-accent-600">
                          <HiMiniUserPlus className="w-8 h-8" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-tight text-accent-900 dark:text-accent-400 mb-2">Pase a Humano</h4>
                        <p className="text-[10px] font-medium text-accent-600/70 leading-relaxed uppercase">Cuando el flujo llegue a este punto, el bot se pausará y un agente humano podrá tomar la conversación.</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Mensaje de Despedida</label>
                        <textarea
                          value={selectedNode.data.message || ''}
                          onChange={(e) => updateNodeData({ message: e.target.value })}
                          placeholder="Ej: Te pondré en contacto con un agente especializado para ayudarte..."
                          className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-sm text-sm outline-none border-2 border-transparent focus:border-accent-500 transition-all min-h-[120px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Connections Section at the bottom */}
                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    {/* Incoming Connections */}
                    <details className="group bg-slate-50 dark:bg-slate-800/20 rounded-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer font-black text-[9px] uppercase tracking-widest text-slate-400 select-none">
                        <span className="flex items-center gap-2 text-accent-600 dark:text-accent-500">
                          <HiMiniPlus className="w-3 h-3 rotate-45" />
                          Conexiones de Entrada: {incomingEdges.length}
                        </span>
                        <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform text-slate-400" />
                      </summary>
                      <div className="p-4 pt-0 space-y-2">
                        {incomingEdges.length > 0 ? (
                          incomingEdges.map(e => {
                            const sourceNode = nodes.find(n => n.id === e.source);
                            return (
                              <div key={e.id} className="group/conn flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-sm shadow-accent-500/50" />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                                      {sourceNode?.type === 'interactive' && e.sourceHandle ? (
                                        `Botón: ${sourceNode.data.buttons?.find((b: any) => b.id === e.sourceHandle)?.text || 'Opción'}`
                                      ) : (
                                        sourceNode?.type || 'Nodo'
                                      )}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 truncate max-w-[150px]">
                                      {sourceNode?.data.text || sourceNode?.data.bodyText || sourceNode?.data.question || (sourceNode?.data.keywords?.join(', ')) || 'Sin contenido'}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => setEdges(eds => eds.filter(ed => ed.id !== e.id))} className="p-1.5 text-rose-500 opacity-0 group-hover/conn:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-sm transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] italic text-slate-400 font-medium text-center py-8">Sin conexiones de entrada</p>
                        )}
                      </div>
                    </details>

                    {/* Outgoing Connections */}
                    <details className="group bg-slate-50 dark:bg-slate-800/20 rounded-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer font-black text-[9px] uppercase tracking-widest text-slate-400 select-none">
                        <span className="flex items-center gap-2 text-accent-600 dark:text-accent-500">
                          <HiMiniPlus className="w-3 h-3" />
                          Conexiones de Salida: {outgoingEdges.length}
                        </span>
                        <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform text-slate-400" />
                      </summary>
                      <div className="p-4 pt-0 space-y-2">
                        {outgoingEdges.length > 0 ? (
                          outgoingEdges.map(e => {
                            const targetNode = nodes.find(n => n.id === e.target);
                            return (
                              <div key={e.id} className="group/conn flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-sm shadow-accent-500/50" />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                                      {selectedNode.type === 'interactive' && e.sourceHandle ? (
                                        `Desde: ${selectedNode.data.buttons?.find((b: any) => b.id === e.sourceHandle)?.text || 'Botón'}`
                                      ) : (
                                        targetNode?.type || 'Siguiente'
                                      )}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 truncate max-w-[150px]">
                                      {targetNode?.data.text || targetNode?.data.bodyText || targetNode?.data.question || 'Conectado'}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => setEdges(eds => eds.filter(ed => ed.id !== e.id))} className="p-1.5 text-rose-500 opacity-0 group-hover/conn:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-sm transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] italic text-slate-400 font-medium text-center py-8">Sin conexiones de salida</p>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showSimulator && <FlowSimulator nodes={nodes} edges={edges} matchingStrategy={matchingStrategy} onClose={() => setShowSimulator(false)} />}
      </div>
    </div>
  );
};
