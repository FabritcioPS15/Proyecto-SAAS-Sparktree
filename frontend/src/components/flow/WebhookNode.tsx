import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';

export const WebhookNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-64 overflow-hidden transition-all hover:scale-[1.02]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-accent-500" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Webhook / API</h3>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        <div className="text-[10px] font-mono break-all text-accent-600 dark:text-accent-400 font-bold uppercase tracking-tighter">
          [{data.method || 'POST'}] {data.url ? 'URL Configurada' : <span className="text-slate-400 italic">Sin URL</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
    </div>
  );
};
