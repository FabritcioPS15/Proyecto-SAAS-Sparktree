import { Handle, Position } from '@xyflow/react';
import { UserCheck } from 'lucide-react';

export const HandoffNode = () => {
  // Transfer to agent node usually doesn't have a source handle (it ends the automated flow)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-secondary-500 w-64 overflow-hidden opacity-90">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-secondary-500" />
      <div className="bg-secondary-500/10 dark:bg-secondary-500/20 px-4 py-3 flex items-center gap-2 border-b border-secondary-500/20">
        <UserCheck className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Agente Humano</h3>
      </div>
      <div className="p-4 text-center">
        <span className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">
          El bot se pausará aquí.
        </span>
      </div>
    </div>
  );
};
