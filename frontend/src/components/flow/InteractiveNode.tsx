import { Handle, Position } from '@xyflow/react';
import { ListPlus } from 'lucide-react';

export const InteractiveNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-purple-500 w-72 overflow-hidden transition-all hover:shadow-purple-500/10">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500 border-2 border-white dark:border-gray-800" />
      <div className="bg-purple-500 px-4 py-3 flex items-center gap-2">
        <ListPlus className="w-4 h-4 text-white" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Botones Interactivos</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-bold leading-relaxed">
          {data.bodyText || <span className="text-xs text-gray-400 italic font-medium">Configura el mensaje principal...</span>}
        </div>
        
        <div className="space-y-2 pt-2">
          {data.buttons?.map((btn: any, i: number) => (
            <div 
              key={btn.id || i} 
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 text-center relative hover:border-indigo-500 transition-colors uppercase tracking-widest"
            >
              {btn.title}
              <Handle 
                 type="source" 
                 position={Position.Right} 
                 id={btn.id} 
                 className="w-3 h-3 bg-purple-500 right-[-6px] top-1/2 transform -translate-y-1/2 border-2 border-white dark:border-gray-800" 
              />
            </div>
          ))}
          {(!data.buttons || data.buttons.length === 0) && (
             <div className="py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Sin botones</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
