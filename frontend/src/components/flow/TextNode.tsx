import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export const TextNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-emerald-500 w-64 overflow-hidden transition-all hover:shadow-emerald-500/10">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800" />
      <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-white" />
        <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Enviar Mensaje</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-bold leading-relaxed line-clamp-3 italic">
          "{data.text || 'Sin mensaje configurado...'}"
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800" />
    </div>
  );
};
