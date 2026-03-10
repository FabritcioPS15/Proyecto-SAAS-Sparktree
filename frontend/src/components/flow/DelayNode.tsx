import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export const DelayNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-stone-500 w-48 overflow-hidden mx-auto">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-stone-500" />
      <div className="bg-stone-500/10 dark:bg-stone-500/20 py-2 flex items-center justify-center gap-2 border-b border-stone-500/20">
        <Clock className="w-4 h-4 text-stone-600 dark:text-stone-400" />
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">Esperar</h3>
      </div>
      <div className="py-3 text-center bg-gray-50/50 dark:bg-gray-900/50">
        <span className="text-lg font-black text-stone-600 dark:text-stone-400">
          {data.delaySeconds || 0}s
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-stone-500" />
    </div>
  );
};
