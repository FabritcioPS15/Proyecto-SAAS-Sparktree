import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg border border-emerald-200 dark:border-emerald-900/50 w-64 overflow-hidden transition-all hover:shadow-emerald-500/10 group node-container">
      <Handle type="source" position={Position.Bottom} className="!bg-white !border-emerald-400 group-hover:!bg-emerald-500" />
      <div className="bg-black dark:bg-gray-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Disparador</h3>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="p-4 bg-white dark:bg-gray-950 group-hover:bg-emerald-50/30 dark:group-hover:bg-emerald-950/20 transition-colors">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block">Palabras Clave</label>
        <div className="flex flex-wrap gap-1.5">
          {data.keywords && data.keywords.length > 0 ? (
            data.keywords.map((kw: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-[9px] font-black text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-tight">
                {kw}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Sin configurar</span>
          )}
        </div>
      </div>
    </div>
  );
};