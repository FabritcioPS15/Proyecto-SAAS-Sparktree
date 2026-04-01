import { Handle, Position, useNodesData } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export const TextNode = ({ id, data: initialData }: any) => {
  const nodeData = useNodesData(id);
  const data = nodeData?.data || initialData;

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-[320px] transition-all hover:scale-[1.01]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent-500" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Enviar Mensaje</h3>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        <div className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-wrap break-words italic">
          "{data.text || 'Sin mensaje configurado...'}"
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
    </div>
  );
};
