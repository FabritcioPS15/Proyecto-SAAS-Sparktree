import React from 'react';
import { DashboardCard } from './DashboardCard';
import { Sparkles, TrendingUp, Bot, MessageCircle, AlertTriangle } from 'lucide-react';

interface Insight {
  type: 'growth' | 'bot' | 'traffic' | 'alert';
  text: string;
}

interface AIInsightsProps {
  insights?: Insight[];
}

const defaultInsights: Insight[] = [
  { type: 'traffic', text: 'Conecta tus canales para empezar a recibir datos.' },
];

export const AIInsights: React.FC<AIInsightsProps> = ({ insights: propInsights }) => {
  const insights = propInsights && propInsights.length > 0 ? propInsights : defaultInsights;

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'bot': return <Bot className="w-4 h-4 text-accent-500" />;
      case 'traffic': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <DashboardCard
      title="AI Insights"
      subtitle="Conclusiones generadas por SparkBot AI"
      icon={<Sparkles className="w-4 h-4" />}
    >
      <div className="space-y-4 pt-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-default">
            <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};
