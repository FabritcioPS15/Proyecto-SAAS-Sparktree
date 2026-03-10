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
import { Save, Bot, Play, Zap, Settings, Layers, Grid3X3, Sparkles, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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
  const [history, setHistory] = useState<{nodes: any[], edges: any[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;
    
    // Save to history before making changes
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
    
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

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // get flow-relative position
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
        case 'handoff': defaultData = {}; break; // No interactive data
        case 'delay': defaultData = { delaySeconds: 3 }; break;
      }

      const newNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  useEffect(() => {
    getFlows().then((data) => {
      if (data && data.length > 0) {
        setNodes(data[0].nodes || defaultNodes);
        setEdges(data[0].edges || defaultEdges);
      }
    }).catch(err => {
      console.error(err);
    });
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFlows({ nodes, edges });
      // TODO: Show toast success
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            Flujos Automáticos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Diseña respuestas automáticas conectando nodos visualmente</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Controls */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`p-2 rounded-lg transition-colors ${showMinimap ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              title="Minimapa"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              title="Cuadrícula"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Deshacer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rehacer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button
              onClick={() => fitView({ padding: 0.2 })}
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Ajustar vista"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => zoomIn()}
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
          
          {/* Action Buttons */}
          <button 
            onClick={clearCanvas}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Limpiar
          </button>
          <button 
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Play className="w-4 h-4 text-gray-600" />
            Simular
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Flujo'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex">
        {/* Main Canvas */}
        <div className="flex-1 h-[600px] relative" ref={reactFlowWrapper}>
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
            <Controls className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden" />
            {showMinimap && (
              <MiniMap 
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
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
        
        {/* Enhanced Sidebar Toolkit */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 flex flex-col gap-6">
           <div>
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Herramientas</h3>
               <Sparkles className="w-4 h-4 text-gray-500" />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'trigger');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                     <Zap className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Disparador</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Palabra clave</span>
                 </div>
               </div>
               
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'text');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                     <Bot className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Mensaje</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Texto simple</span>
                 </div>
               </div>
               
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'interactive');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                     <Grid3X3 className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Interactivo</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Botones</span>
                 </div>
               </div>
               
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'media');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                     <Layers className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Multimedia</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Imagen/Video</span>
                 </div>
               </div>
               
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'capture');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                     <Settings className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Capturar</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Datos</span>
                 </div>
               </div>
               
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'webhook');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                     <Zap className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Webhook</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">API</span>
                 </div>
               </div>

               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'delay');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                     <Undo2 className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Retraso</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Esperar</span>
                 </div>
               </div>
                 
               <div 
                 className="group p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'handoff');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                     <Bot className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">Agente</span>
                   <span className="text-xs text-gray-600 dark:text-gray-500">Humano</span>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="pt-6 border-t border-gray-200/50 dark:border-gray-800/50 flex-1 overflow-y-auto custom-scrollbar pr-2 bg-gray-50 dark:bg-gray-900">
             <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Propiedades</h3>
             
             {!selectedNode ? (
               <div className="text-center text-gray-400 text-sm italic mt-10">
                  Selecciona un nodo en el mapa para editar sus propiedades aquí.
               </div>
             ) : (
               <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                 {/* ID and Type Header */}
                 <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ID: {selectedNode.id}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{selectedNode.type}</span>
                 </div>

                 {/* TRIGGER NODE EDITOR */}
                 {selectedNode.type === 'trigger' && (
                   <div className="space-y-3">
                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Palabras Clave</label>
                     <p className="text-xs text-gray-500 mb-2">Separadas por comas</p>
                     <textarea 
                       className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none h-24"
                       value={selectedNode.data.keywordString !== undefined ? selectedNode.data.keywordString : (selectedNode.data.keywords?.join(', ') || '')}
                       onChange={(e) => {
                         const raw = e.target.value;
                         const vals = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
                         updateNodeData({ keywords: vals, keywordString: raw });
                       }}
                       placeholder="ej: hola, precio, ayuda"
                     />
                   </div>
                 )}

                 {/* TEXT NODE EDITOR */}
                 {selectedNode.type === 'text' && (
                   <div className="space-y-3">
                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Mensaje del Bot</label>
                     <textarea 
                       className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                       value={selectedNode.data.text || ''}
                       onChange={(e) => updateNodeData({ text: e.target.value })}
                       placeholder="Escribe la respuesta aquí..."
                     />
                   </div>
                 )}

                 {/* INTERACTIVE NODE EDITOR */}
                 {selectedNode.type === 'interactive' && (
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Texto Principal</label>
                       <textarea 
                         className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all h-24"
                         value={selectedNode.data.bodyText || ''}
                         onChange={(e) => updateNodeData({ bodyText: e.target.value })}
                         placeholder="Ej: Elige una opción abajo👇"
                       />
                     </div>
                     
                     <div>
                       <div className="flex items-center justify-between mb-2">
                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Botones (Máx 3)</label>
                         <button 
                           onClick={() => {
                             const currentBtns = selectedNode.data.buttons || [];
                             if (currentBtns.length >= 3) return;
                             const newBtn = { id: `btn_${Date.now()}`, title: 'Nuevo Botón' };
                             updateNodeData({ buttons: [...currentBtns, newBtn] });
                           }}
                           disabled={(selectedNode.data.buttons?.length || 0) >= 3}
                           className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline disabled:opacity-50"
                         >
                           + Agregar
                         </button>
                       </div>
                       
                       <div className="space-y-2">
                         {selectedNode.data.buttons?.map((btn: any, index: number) => (
                           <div key={index} className="flex gap-2">
                             <input 
                               type="text"
                               className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                               value={btn.title}
                               onChange={(e) => {
                                 const newBtns = [...selectedNode.data.buttons];
                                 newBtns[index].title = e.target.value;
                                 updateNodeData({ buttons: newBtns });
                               }}
                             />
                             <button
                               onClick={() => {
                                 const newBtns = selectedNode.data.buttons.filter((_:any, i:number) => i !== index);
                                 updateNodeData({ buttons: newBtns });
                               }}
                               className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                             >
                               x
                             </button>
                           </div>
                         ))}
                       </div>
                     </div>
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

