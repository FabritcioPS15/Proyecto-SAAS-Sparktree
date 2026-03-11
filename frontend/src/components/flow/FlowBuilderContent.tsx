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
import { Save, Bot, Play, Zap, Settings, Layers, Grid3X3, Sparkles, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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
  };
}

export const FlowBuilderContent = ({ flowData }: FlowBuilderContentProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges || []);
  const [currentTriggers, setCurrentTriggers] = useState(flowData.triggers || []);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([{ nodes: flowData.nodes || [], edges: flowData.edges || [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = { ...node, data: { ...node.data, ...newData } };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const updateFlowTriggers = (newTriggers: string[]) => {
    setCurrentTriggers(newTriggers);
    // Update flowData triggers
    flowData.triggers = newTriggers;
    console.log('Flow triggers updated:', newTriggers);
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

  const onConnect = useCallback((params: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
    setEdges((eds) => addEdge(params, eds));
  }, [nodes, edges, history, historyIndex]);

  const saveFlow = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: flowData.name,
        nodes,
        edges,
        triggers: currentTriggers
      };
      const result = await saveFlows(payload, flowData.id || flowData._id);
      console.log('Flow saved:', result);
      
      // Update flowData to reflect saved changes
      flowData.triggers = currentTriggers;
      
      // Show success message and reload to show persisted changes
      setSaveSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
      data: type === 'trigger' ? { keywords: flowData.triggers || [] } : {}
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes, newNode], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
    setNodes([...nodes, newNode]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          saveFlow();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  return (
    <div className="h-full flex">
      {/* Main Canvas */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`p-2 rounded-xl transition-all duration-200 ${showMinimap ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              title="Minimapa"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-xl transition-all duration-200 ${showGrid ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              title="Cuadrícula"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={() => fitView({ duration: 800 })}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="Ajustar vista"
            >
              <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => zoomIn({ duration: 300 })}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => zoomOut({ duration: 300 })}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Node Palette */}
        <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-3 w-64">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            Nodos Disponibles
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => addNode('trigger')}
              className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-200 border border-blue-200/50 dark:border-blue-800/50"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Disparador</span>
              </div>
            </button>
            <button
              onClick={() => addNode('text')}
              className="w-full text-left px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 rounded-xl transition-all duration-200 border border-emerald-200/50 dark:border-emerald-800/50"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Mensaje de Texto</span>
              </div>
            </button>
            <button
              onClick={() => addNode('interactive')}
              className="w-full text-left px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 rounded-xl transition-all duration-200 border border-purple-200/50 dark:border-purple-800/50"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Interactivo</span>
              </div>
            </button>
            <button
              onClick={() => addNode('media')}
              className="w-full text-left px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 rounded-xl transition-all duration-200 border border-amber-200/50 dark:border-amber-800/50"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Media</span>
              </div>
            </button>
          </div>
        </div>

        {/* Flow Canvas */}
        <div ref={reactFlowWrapper} className="h-full">
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
            <Controls showInteractive={false} />
            {showMinimap && <MiniMap />}
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-800/50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Propiedades
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Flow Configuration - Always Visible */}
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
              <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Configuración del Flow
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-indigo-600 dark:text-indigo-300 mb-1">
                    Triggers del Flow (Palabras clave para iniciar)
                  </label>
                  <textarea
                    value={currentTriggers?.join(', ') || ''}
                    onChange={(e) => {
                      const newTriggers = e.target.value.split(',').map(k => k.trim()).filter(k => k.length >= 2 && k.length <= 20);
                      // Limit to maximum 10 triggers
                      if (newTriggers.length > 10) {
                        newTriggers.splice(10);
                      }
                      updateFlowTriggers(newTriggers);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-500/30 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                    placeholder="hola, nuevo, buenos días, inicio, bienvenida, registro"
                  />
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    Separa cada trigger con una coma (máx. 10 triggers, 2-20 caracteres cada uno). Estas palabras activarán el flow.
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {currentTriggers?.map((trigger, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium">
                      {trigger}
                    </span>
                  )) || <span className="text-xs text-indigo-500 italic">Sin triggers configurados</span>}
                </div>
              </div>
            </div>

            {/* Selected Node Properties */}
            {selectedNode ? (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Nodo
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 font-medium">
                    {selectedNode.type}
                  </div>
                </div>

                {selectedNode.type === 'trigger' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Palabras Clave (Triggers)
                    </label>
                    <div className="space-y-2">
                      <textarea
                        value={currentTriggers?.join(', ') || ''}
                        onChange={(e) => {
                          const newTriggers = e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0);
                          // Update flow triggers
                          updateFlowTriggers(newTriggers);
                          // Also update node keywords for display
                          updateNodeData({ keywords: newTriggers });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="hola, nuevo, buenos días, inicio, bienvenida, registro"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Separa cada trigger con una coma. Estos son los triggers del flow completo.
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentTriggers?.map((trigger, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-medium">
                            {trigger}
                          </span>
                        )) || <span className="text-xs text-gray-400 italic">Sin triggers configurados</span>}
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={selectedNode.data.text || ''}
                      onChange={(e) => updateNodeData({ text: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID del Nodo
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 font-mono text-sm">
                    {selectedNode.id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Posición
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedNode.position.x)}
                        onChange={(e) => updateNodeData({ position: { ...selectedNode.position, x: parseInt(e.target.value) } })}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedNode.position.y)}
                        onChange={(e) => updateNodeData({ position: { ...selectedNode.position, y: parseInt(e.target.value) } })}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300">Sin selección</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Selecciona un nodo para ver y editar sus propiedades
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
            {saveSuccess && (
              <div className="mb-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                <span>✓</span>
                Cambios guardados exitosamente. Recargando...
              </div>
            )}
            <button
              onClick={saveFlow}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Flujo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Flow Simulator */}
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
