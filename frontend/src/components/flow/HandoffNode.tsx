import { Handle, Position } from '@xyflow/react';
import { UserCheck } from 'lucide-react';

export const HandoffNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-64 overflow-hidden transition-all hover:scale-[1.02]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-[#11141b]" />
      
      <div className="bg-black p-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-500">
           <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-[11px] text-white uppercase tracking-widest">Agente Humano</h3>
          <p className="text-[9px] text-accent-500 font-black uppercase tracking-widest leading-none">Pase a Humano</p>
        </div>
      </div>

      <div className="p-5">
        <div className="bg-slate-50 dark:bg-slate-800/10 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
           <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-relaxed text-center font-bold">
             "{data.message || 'El bot se pausará aquí para que intervenga un humano.'}"
           </p>
        </div>
        <div className="mt-4 flex justify-center">
           <div className="px-3 py-1 bg-accent-500/10 rounded-full border border-accent-500/20">
              <span className="text-[8px] font-black text-accent-600 dark:text-accent-400 uppercase tracking-widest animate-pulse">Pausa Activada</span>
           </div>
        </div>
      </div>
    </div>
  );
};
