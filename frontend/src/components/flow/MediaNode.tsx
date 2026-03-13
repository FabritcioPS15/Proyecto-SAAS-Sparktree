import { Handle, Position } from '@xyflow/react';
import { Image, Play } from 'lucide-react';

export const MediaNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-accent-500 w-64 overflow-hidden transition-all hover:shadow-accent-500/10 hover:scale-[1.02]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-accent-500 border-2 border-white dark:border-gray-800" />
      <div className="bg-accent-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-white" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Multimedia</h3>
        </div>
        <span className="text-[10px] font-black text-accent-100 uppercase tracking-widest opacity-70">
          {data.mediaType || 'image'}
        </span>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        {data.mediaUrl ? (
          <div className="space-y-3">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
              {data.mediaType === 'image' && <img src={data.mediaUrl} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />}
              <div className="absolute inset-0 flex items-center justify-center">
                 <Play className="w-6 h-6 text-accent-500 opacity-50" />
              </div>
            {data.isViewOnce && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest shadow-lg">
                1 Vista
              </div>
            )}
            {data.fileName && (
              <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[8px] text-white font-mono truncate">
                {data.fileName}
              </div>
            )}
          </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold truncate italic">
              {data.mediaUrl}
            </div>
            {data.caption && (
               <div className="text-xs text-gray-700 dark:text-gray-300 font-medium line-clamp-2 border-l-2 border-accent-500/30 pl-2 py-1">
                 {data.caption}
               </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
             <Image className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
             <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Sin configurar</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-accent-500 border-2 border-white dark:border-gray-800" />
    </div>
  );
};
