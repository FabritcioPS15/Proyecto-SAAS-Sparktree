import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-64 overflow-hidden transition-all hover:scale-[1.02]">
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-500" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Disparador</h3>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cuando escriben:</label>
        <div className="flex flex-wrap gap-1">
          {data.keywords && data.keywords.length > 0 ? (
            data.keywords.map((kw: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-[9px] font-black text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">
                {kw}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Inicia el flujo...</span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-900 border-2 border-white dark:border-gray-800" />
    </div>
  );
};
