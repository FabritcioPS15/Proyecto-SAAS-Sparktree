import { Handle, Position } from '@xyflow/react';
import { FormInput } from 'lucide-react';

export const CaptureNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-amber-500 w-64 overflow-hidden transition-all hover:shadow-amber-500/10">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500 border-2 border-white dark:border-gray-800" />
      <div className="bg-amber-500 px-4 py-3 flex items-center gap-2">
        <FormInput className="w-4 h-4 text-white" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Capturar Dato</h3>
      </div>
      <div className="p-4 space-y-3">
         <p className="text-sm text-gray-600 dark:text-gray-300 font-bold leading-relaxed line-clamp-2">
          {data.question || <span className="text-xs text-gray-400 italic font-medium">¿Qué quieres preguntar?</span>}
         </p>
         <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 rounded text-[9px] font-black text-amber-700 dark:text-amber-400 border border-amber-200/50 uppercase tracking-tighter">
              Dato: {data.variableName || '?'}
            </div>
            <div className="flex items-center gap-1">
              {data.allowSkip && (
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-[7px] font-black text-gray-500 rounded uppercase border border-gray-200 dark:border-gray-700">
                  Saltable
                </span>
              )}
              <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                {data.validationType || 'any'}
              </div>
            </div>
         </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-white dark:border-gray-800" />
    </div>
  );
};
