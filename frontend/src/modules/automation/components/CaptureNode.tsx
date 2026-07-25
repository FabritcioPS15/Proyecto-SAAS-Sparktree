import { Handle, Position, useNodesData } from '@xyflow/react';
import { BrainCircuit } from 'lucide-react';

export const CaptureNode = ({ id, data: initialData }: any) => {
  const nodeData = useNodesData(id);
  const data = nodeData?.data || initialData;

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg border border-cyan-200 dark:border-cyan-900/50 w-[320px] overflow-hidden transition-all hover:shadow-cyan-500/10 group node-container">
      <Handle type="target" position={Position.Top} className="!bg-white !border-cyan-400 group-hover:!bg-cyan-500" />
      <div className="bg-black dark:bg-gray-900 px-4 py-3 flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-cyan-400" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Capturar Dato</h3>
      </div>
      <div className="p-4 space-y-3 bg-white dark:bg-gray-950 group-hover:bg-cyan-50/30 dark:group-hover:bg-cyan-950/20 transition-colors">
        {data.question ? (
          <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed whitespace-pre-wrap">{data.question}</p>
        ) : (
          <div className="flex items-center justify-center py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Sin pregunta</span>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">@</span>
          <span className="text-[9px] font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800/50 uppercase tracking-tight">
            {data.variableName || 'variable'}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-white !border-cyan-400 group-hover:!bg-cyan-500" />
    </div>
  );
};