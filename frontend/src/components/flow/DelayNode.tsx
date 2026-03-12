import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export const DelayNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-stone-500 w-48 overflow-hidden transition-all hover:shadow-stone-500/10 hover:scale-[1.02] mx-auto">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-stone-500 border-2 border-white dark:border-gray-800" />
      <div className="bg-stone-500 px-4 py-2 flex items-center justify-center gap-2">
        <Clock className="w-3 h-3 text-white" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Esperar</h3>
      </div>
      <div className="py-4 text-center bg-white dark:bg-gray-900/50">
        <span className="text-2xl font-black text-stone-600 dark:text-stone-400">
          {data.delaySeconds || 3}s
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-stone-500 border-2 border-white dark:border-gray-800" />
    </div>
  );
};
