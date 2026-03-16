// components/DashboardRouter.tsx
import { useAuth } from '../contexts/AuthContext';
import { SimpleDashboard } from './SimpleDashboard';
import { FlowBuilderContent } from './flow/FlowBuilderContent';

export const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Redirigiendo al login...</div>;
  }

  // Mostrar dashboard simple según rol + Flow Builder
  return (
    <div>
      <SimpleDashboard />
      {/* Flow Builder accesible para todos los roles */}
      <div className="mt-8">
        <FlowBuilderContent 
          flowData={{
            id: '',
            name: 'Nuevo Flow',
            nodes: [],
            edges: [],
            triggers: [],
            botMode: 'general_response',
            fallbackMessage: 'Lo siento, no entiendo tu mensaje. ¿En qué puedo ayudarte?',
            status: 'draft',
            category: 'other'
          }}
        />
      </div>
    </div>
  );
};
