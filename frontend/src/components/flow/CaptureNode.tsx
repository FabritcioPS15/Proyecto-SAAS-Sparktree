import { Handle, Position } from '@xyflow/react';
import { FormInput } from 'lucide-react';

export const CaptureNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-amber-500 w-64 overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
      <div className="bg-amber-500/10 dark:bg-amber-500/20 px-4 py-3 flex items-center gap-2 border-b border-amber-500/20">
        <FormInput className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Capturar Dato</h3>
      </div>
      <div className="p-4">
         <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
          {data.question || <span className="text-xs text-gray-400 italic">Pregunta...</span>}
         </p>
         <div className="bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1 text-xs font-mono text-amber-700 dark:text-amber-400 inline-block border border-amber-200 dark:border-amber-800">
           Guardar en: {data.variableName || '?'}
         </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500" />
    </div>
  );
};
