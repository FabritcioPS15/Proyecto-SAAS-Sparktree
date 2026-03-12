import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-emerald-500 w-64 overflow-hidden transition-all hover:shadow-emerald-500/10 hover:scale-[1.02]">
      <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-white" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Palabra Clave</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        <div className="flex flex-wrap gap-1">
          {data.keywords && data.keywords.length > 0 ? (
            data.keywords.map((kw: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-[9px] font-black text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800 uppercase tracking-tighter">
                {kw}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Inicia el flujo...</span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800" />
    </div>
  );
};
