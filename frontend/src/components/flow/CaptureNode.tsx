import { Handle, Position, useNodesData } from '@xyflow/react';
import { BrainCircuit } from 'lucide-react';

export const CaptureNode = ({ id, data: initialData }: any) => {
  const nodeData = useNodesData(id);
  const data = nodeData?.data || initialData;

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-[320px] transition-all">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-accent-500" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Capturar Dato</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
         <p className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">
          {data.question || <span className="text-xs text-slate-400 italic font-medium">¿Qué quieres preguntar?</span>}
         </p>
         <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400">
               <span className="text-[10px] font-black uppercase tracking-widest">Variable:</span>
               <span className="text-[10px] font-bold bg-accent-500/10 px-2 py-0.5 rounded-md">
                 {data.variableName || '?'}
               </span>
            </div>
         </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
    </div>
  );
};
