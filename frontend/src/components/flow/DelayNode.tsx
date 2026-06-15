import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export const DelayNode = ({ data }: any) => {
  const seconds = data.delaySeconds || 3;
  const displayTime = seconds >= 60 
    ? `${(seconds / 60).toFixed(1)}m` 
    : `${seconds}s`;

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-48 overflow-hidden transition-all hover:scale-[1.02] group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-[#11141b]" />
      
      <div className="bg-black p-4 flex flex-col items-center justify-center gap-1 border-b border-white/5">
        <Clock className="w-6 h-6 text-accent-500 animate-pulse" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Esperar</h3>
      </div>

      <div className="p-6 text-center bg-white dark:bg-[#11141b]">
        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
          {displayTime}
        </span>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 font-inter">Pausa en el flujo</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-black border-2 border-white dark:border-[#11141b]" />
    </div>
  );
};
