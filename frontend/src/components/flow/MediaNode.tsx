import { Handle, Position } from '@xyflow/react';
import { Image, Play } from 'lucide-react';

export const MediaNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-xl border-2 border-black dark:border-white/10 w-64 overflow-hidden transition-all hover:scale-[1.02]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-accent-500" />
          <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Multimedia</h3>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        {data.mediaUrl ? (
          <div className="space-y-3">
             <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
              {data.mediaType === 'image' && <img src={data.mediaUrl} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />}
              <div className="absolute inset-0 flex items-center justify-center">
                 <Play className="w-6 h-6 text-accent-500 opacity-50" />
              </div>
            {data.isViewOnce && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent-500 text-[8px] font-black text-black rounded-full uppercase tracking-widest shadow-lg">
                1 Vista
              </div>
            )}
          </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate italic">
              {data.mediaUrl}
            </div>
            {data.caption && (
               <div className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 border-l-2 border-accent-500/30 pl-2 py-1">
                 {data.caption}
               </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
             <Image className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Sin configurar</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-black border-2 border-white dark:border-gray-800" />
    </div>
  );
};
