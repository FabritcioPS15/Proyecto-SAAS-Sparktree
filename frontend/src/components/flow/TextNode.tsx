import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export const TextNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-blue-500 w-64 overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="bg-blue-500/10 dark:bg-blue-500/20 px-4 py-3 flex items-center gap-2 border-b border-blue-500/20">
        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Mensaje de Texto</h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {data.text || <span className="text-xs text-gray-400 italic">Escribe un mensaje...</span>}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};
