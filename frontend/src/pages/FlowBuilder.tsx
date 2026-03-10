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
import { Save, Bot, Play } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;
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
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
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
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Flujos Automáticos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Diseña respuestas automáticas conectando nodos visualmente</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Play className="w-4 h-4 text-emerald-500" />
            Simular
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Flujo'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm overflow-hidden flex">
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
            <Controls className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden" />
            <MiniMap 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
              maskColor="rgba(0,0,0,0.1)"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#9CA3AF" />
          </ReactFlow>
        </div>
        
        {/* Sidebar Toolkit */}
        <div className="w-72 border-l border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900 p-6 flex flex-col gap-6">
           <div>
             <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Herramientas</h3>
             <div className="space-y-3">
               <div 
                 className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-grab hover:shadow-md transition-shadow"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'trigger');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disparador (Palabra)</span>
               </div>
               <div 
                 className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl cursor-grab hover:shadow-md transition-shadow"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'text');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Mensaje Texto</span>
               </div>
               <div 
                 className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl cursor-grab hover:shadow-md transition-shadow"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'interactive');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Botones / Menú</span>
               </div>
               
               <div 
                 className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl cursor-grab hover:shadow-md transition-shadow"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'media');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <span className="text-sm font-semibold text-pink-700 dark:text-pink-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Multimedia</span>
               </div>
               
               <div 
                 className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl cursor-grab hover:shadow-md transition-shadow"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'capture');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Capturar Dato</span>
               </div>
               
               <div 
                 className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl cursor-grab hover:shadow-md transition-shadow"
                 onDragStart={(event) => {
                   event.dataTransfer.setData('application/reactflow', 'webhook');
                   event.dataTransfer.effectAllowed = 'move';
                 }}
                 draggable
               >
                 <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Webhook / API</span>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <div 
                   className="p-2 bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-800 rounded-xl cursor-grab hover:shadow-md transition-shadow text-center"
                   onDragStart={(event) => {
                     event.dataTransfer.setData('application/reactflow', 'delay');
                     event.dataTransfer.effectAllowed = 'move';
                   }}
                   draggable
                 >
                   <span className="text-xs font-semibold text-stone-700 dark:text-stone-400">Retraso</span>
                 </div>
                 
                 <div 
                   className="p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl cursor-grab hover:shadow-md transition-shadow text-center"
                   onDragStart={(event) => {
                     event.dataTransfer.setData('application/reactflow', 'handoff');
                     event.dataTransfer.effectAllowed = 'move';
                   }}
                   draggable
                 >
                   <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Agente</span>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="pt-6 border-t border-gray-200/50 dark:border-gray-800/50 flex-1 overflow-y-auto custom-scrollbar pr-2">
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

