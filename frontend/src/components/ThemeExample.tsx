import { Settings, MessageSquare, CreditCard } from 'lucide-react';

export const ThemeExample = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header con título estructural fijo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="structural-title text-2xl mb-2">Panel de Control</h1>
        <p className="structural-subtitle">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Plan - Elemento Estructural FIJO */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-emerald-500">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            <h3 className="plan-title">Plan Actual</h3>
          </div>
          <div className="space-y-2">
            <p className="structural-subtitle">Plan Profesional</p>
            <p className="text-3xl font-bold text-emerald-500">$29/mes</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Renovación: 15 de marzo</p>
          </div>
        </div>

        {/* Card de Configuración - Personalizable */}
        <div className="theme-card">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 theme-primary" />
            <h3 className="customizable-card-title">Configuración</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="customizable-subtitle">Tema</span>
              <span className="theme-primary theme-font-semibold">Personalizado</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="customizable-subtitle">Idioma</span>
              <span className="theme-primary theme-font-semibold">Español</span>
            </div>
          </div>
        </div>

        {/* Card de Chats - Personalizable */}
        <div className="theme-card">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 theme-primary" />
            <h3 className="customizable-card-title">Chats Activos</h3>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 theme-primary-bg pl-3">
              <h4 className="chat-title">Juan Pérez</h4>
              <p className="chat-subtitle">Hola, ¿cómo estás?</p>
            </div>
            <div className="border-l-4 theme-primary-bg pl-3">
              <h4 className="chat-title">María García</h4>
              <p className="chat-subtitle">Gracias por la ayuda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de mensajes - Personalizable */}
      <div className="theme-card">
        <h2 className="customizable-title text-xl mb-4">Mensajes Recientes</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 theme-surface rounded-lg">
            <div className="w-8 h-8 theme-primary-bg rounded-full flex items-center justify-center text-white text-sm font-bold">
              JP
            </div>
            <div className="flex-1">
              <h4 className="chat-title">Juan Pérez</h4>
              <p className="chat-subtitle">Necesito ayuda con mi cuenta</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hace 5 minutos</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 theme-surface rounded-lg">
            <div className="w-8 h-8 theme-secondary-bg rounded-full flex items-center justify-center text-white text-sm font-bold">
              MG
            </div>
            <div className="flex-1">
              <h4 className="chat-title">María García</h4>
              <p className="chat-subtitle">El servicio está funcionando perfecto</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hace 1 hora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
