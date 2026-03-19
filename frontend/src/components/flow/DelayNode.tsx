import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export const DelayNode = ({ data }: any) => {
  const seconds = data.delaySeconds || 3;
  const displayTime = seconds >= 60 
    ? `${(seconds / 60).toFixed(1)}m` 
    : `${seconds}s`;

  return (
    <div className="bg-white dark:bg-[#11141b] rounded-[2rem] shadow-2xl border-2 border-stone-500 w-48 overflow-hidden transition-all hover:scale-105 active:scale-95 group">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-stone-500 border-2 border-white dark:border-[#11141b]" />
      
      <div className="bg-stone-500 p-4 flex flex-col items-center justify-center gap-1">
        <Clock className="w-6 h-6 text-white animate-pulse" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Esperar</h3>
      </div>

      <div className="p-6 text-center bg-white dark:bg-[#11141b]">
        <span className="text-4xl font-black text-stone-600 dark:text-stone-400 tracking-tighter">
          {displayTime}
        </span>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Pausa en el flujo</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-stone-500 border-2 border-white dark:border-[#11141b]" />
    </div>
  );
};
