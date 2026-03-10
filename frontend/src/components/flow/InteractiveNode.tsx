import { Handle, Position } from '@xyflow/react';
import { ListPlus } from 'lucide-react';

export const InteractiveNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-purple-500 w-64 overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="bg-purple-500/10 dark:bg-purple-500/20 px-4 py-3 flex items-center gap-2 border-b border-purple-500/20">
        <ListPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Interactividad</h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {data.bodyText || <span className="text-xs text-gray-400 italic">Texto descriptivo...</span>}
        </p>
        <div className="space-y-2">
          {data.buttons?.map((btn: any, i: number) => (
            <div key={btn.id || i} className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-300 text-center relative group">
              {btn.title}
              <Handle 
                 type="source" 
                 position={Position.Right} 
                 id={btn.id} 
                 className="w-3 h-3 bg-purple-500 right-[-8px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </div>
          ))}
          {(!data.buttons || data.buttons.length === 0) && (
             <div className="text-xs text-center text-gray-400 italic">Agregar botones</div>
          )}
        </div>
      </div>
    </div>
  );
};
