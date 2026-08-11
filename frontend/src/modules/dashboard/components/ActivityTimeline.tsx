import React from 'react';
import { DashboardCard } from './DashboardCard';
import { Activity, UserPlus, MessageSquare, Zap, Link } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ActivityItem {
  id: string;
  type: 'user' | 'message' | 'flow' | 'channel';
  title: string;
  time: string;
}

export const ActivityTimeline = () => {
  const activities: ActivityItem[] = [
    { id: '1', type: 'user', title: 'Usuario registrado', time: 'Hace 3 min' },
    { id: '2', type: 'message', title: 'Nuevo mensaje', time: 'Hace 5 min' },
    { id: '3', type: 'flow', title: 'Flujo ejecutado', time: 'Hace 8 min' },
    { id: '4', type: 'channel', title: 'Canal conectado', time: 'Hace 15 min' },
  ];

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user': return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
      case 'message': return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'flow': return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'channel': return <Link className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <DashboardCard
      title="Actividad Reciente"
      icon={<Activity className="w-4 h-4" />}
    >
      <div className="relative mt-2 pl-4">
        {/* Vertical line connecting timeline items */}
        <div className="absolute top-2 bottom-2 left-4 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>
        
        <div className="space-y-6">
          {activities.map((item, idx) => (
            <div key={item.id} className="relative flex items-start gap-4">
              <div className="absolute -left-4 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 top-1.5 -translate-x-1/2 ring-4 ring-white dark:ring-[#242424]"></div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-md">
                    {getIcon(item.type)}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-medium ml-8 mt-0.5">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};
