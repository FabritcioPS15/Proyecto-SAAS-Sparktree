import { Handle, Position } from '@xyflow/react';
import { Target } from 'lucide-react';

export const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-emerald-500 w-64 overflow-hidden">
      <div className="bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-3 flex items-center gap-2 border-b border-emerald-500/20">
        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Palabra Clave</h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Si el cliente dice:</p>
        <div className="flex flex-wrap gap-1">
          {data.keywords?.map((k: string, i: number) => (
            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
              {k}
            </span>
          )) || <span className="text-xs text-gray-400 italic">Sin configurar</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
};
