import { Handle, Position } from '@xyflow/react';
import { UserCheck } from 'lucide-react';

export const HandoffNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-[#11141b] rounded-2xl shadow-xl border-2 border-indigo-500 w-64 overflow-hidden group transition-all hover:scale-105 active:scale-95">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-indigo-500 border-2 border-white dark:border-[#11141b]" />
      
      <div className="bg-indigo-500 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
           <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-[11px] text-white uppercase tracking-widest">Agente Humano</h3>
          <p className="text-[9px] text-white/70 font-bold uppercase tracking-tighter">Pase a Humano</p>
        </div>
      </div>

      <div className="p-5">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
           <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-relaxed text-center">
             {data.message || 'El bot se pausará aquí para que intervenga un humano.'}
           </p>
        </div>
        <div className="mt-4 flex justify-center">
           <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800">
              <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">Pausa Activada</span>
           </div>
        </div>
      </div>
    </div>
  );
};
