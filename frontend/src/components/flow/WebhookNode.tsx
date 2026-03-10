import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';

export const WebhookNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-cyan-500 w-64 overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-cyan-500" />
      <div className="bg-cyan-500/10 dark:bg-cyan-500/20 px-4 py-3 flex items-center gap-2 border-b border-cyan-500/20">
        <Webhook className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Webhook / API</h3>
      </div>
      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="text-xs font-mono break-all text-cyan-600 dark:text-cyan-400">
          [{data.method || 'POST'}] {data.url ? 'URL Configurada' : <span className="text-gray-400 italic">Sin URL</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-cyan-500" />
    </div>
  );
};
