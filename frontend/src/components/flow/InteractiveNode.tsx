import { Handle, Position, useNodesData } from '@xyflow/react';
import { ListPlus } from 'lucide-react';

export const InteractiveNode = ({ id, data: initialData }: any) => {
  const nodeData = useNodesData(id);
  const data = nodeData?.data || initialData;

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-[320px] transition-all">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <ListPlus className="w-4 h-4 text-accent-500" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Botones Interactivos</h3>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-wrap break-words">
          {data.bodyText || <span className="text-xs text-slate-400 italic font-medium">Configura el mensaje principal...</span>}
        </div>
        
        <div className="space-y-2 pt-2">
          {data.buttons?.map((btn: any, i: number) => (
            <div 
              key={btn.id || `btn-${i}`} 
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-accent-600 dark:text-accent-400 text-center relative hover:border-accent-500 transition-colors uppercase tracking-widest"
            >
              {btn.text || btn.title}
              <Handle 
                type="source" 
                position={Position.Right} 
                id={btn.id || `btn-${i}`} 
                className="w-4 h-4 bg-black hover:bg-black transition-colors right-[-8px] top-1/2 transform -translate-y-1/2 border-2 border-accent-500 shadow-md cursor-crosshair" 
              />
            </div>
          ))}
          {(!data.buttons || data.buttons.length === 0) && (
             <div className="py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Sin botones</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
