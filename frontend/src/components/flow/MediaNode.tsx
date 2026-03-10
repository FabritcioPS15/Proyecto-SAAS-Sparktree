import { Handle, Position } from '@xyflow/react';
import { Image } from 'lucide-react';

export const MediaNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-pink-500 w-64 overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-pink-500" />
      <div className="bg-pink-500/10 dark:bg-pink-500/20 px-4 py-3 flex items-center gap-2 border-b border-pink-500/20">
        <Image className="w-5 h-5 text-pink-600 dark:text-pink-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Multimedia</h3>
      </div>
      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center justify-center min-h-[80px]">
        {data.mediaUrl ? (
          <div className="text-xs text-center break-all text-pink-600 dark:text-pink-400 font-medium">
            Enlace configurado
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Sin URL...</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-pink-500" />
    </div>
  );
};
