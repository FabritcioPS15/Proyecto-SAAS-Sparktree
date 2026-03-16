import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, HelpCircle, Palette, Database, Activity, Clock, Star } from 'lucide-react';
import { getSettings } from '../services/api';
import { ThemeCustomizer } from '../components/ThemeCustomizer';
import { ThemeExample } from '../components/ThemeExample';
import { AdvancedCard, PlanCard, ChatCard, StatsCard } from '../components/AdvancedCard';
import { WhatsAppChat } from '../components/WhatsAppChat';

export const Settings = () => {
  const [settings, setSettings] = useState({
    botName: '',
    systemStatus: 'inactive'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 p-4 lg:p-5 space-y-4 relative overflow-y-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-5 lg:p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-xl duration-500">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Configuración <span className="text-slate-400">General</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
              Gestiona la identidad de tu bot, conexiones de API y parámetros globales del sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {/* Theme Customizer Section - Área Principal */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Personalización de Tema
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Configura colores, tipografía y diseño de la interfaz
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ThemeCustomizer />
              </div>
            </div>

            {/* Demo Section - Theme Preview */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Vista Previa del Tema
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Demo Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Button Demo */}
                  <div className="theme-card">
                    <h4 className="theme-text-lg theme-font-semibold mb-4">Botones Principales</h4>
                    <div className="space-y-3">
                      <button className="theme-button-primary w-full">
                        Botón Primario
                      </button>
                      <button className="theme-button-secondary w-full">
                        Botón Secundario
                      </button>
                    </div>
                  </div>

                  {/* Input Demo */}
                  <div className="theme-card">
                    <h4 className="theme-text-lg theme-font-semibold mb-4">Campos de Entrada</h4>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        className="theme-input w-full" 
                        placeholder="Nombre de usuario"
                      />
                      <input 
                        type="email" 
                        className="theme-input w-full" 
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  {/* Typography Demo */}
                  <div className="theme-card">
                    <h4 className="theme-text-lg theme-font-semibold mb-4">Tipografía - Fijos vs Personalizables</h4>
                    <div className="space-y-4">
                      {/* Elementos Estructurales FIJOS */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h5 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Elementos Estructurales (FIJOS)</h5>
                        <h3 className="plan-title mb-2">Plan Actual</h3>
                        <h4 className="structural-card-title mb-2">Título de Card Importante</h4>
                        <p className="structural-subtitle">Subtítulo estructural fijo</p>
                      </div>
                      
                      {/* Elementos Personalizables */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">Elementos Personalizables</h5>
                        <h3 className="customizable-title mb-2">Título Personalizable</h3>
                        <h4 className="customizable-card-title mb-2">Título de Card Personalizable</h4>
                        <p className="customizable-subtitle">Subtítulo personalizable</p>
                      </div>
                      
                      {/* Elementos de Chat */}
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h5 className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">Elementos de Chat</h5>
                        <h3 className="chat-title mb-2">Juan Pérez</h3>
                        <p className="chat-subtitle">Último mensaje: 12:30</p>
                      </div>
                    </div>
                  </div>

                  {/* Colors Demo */}
                  <div className="theme-card">
                    <h4 className="theme-text-lg theme-font-semibold mb-4">Paleta de Colores</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="theme-primary-bg p-4 rounded text-white text-center text-xs">
                        Primary
                      </div>
                      <div className="theme-secondary-bg p-4 rounded text-white text-center text-xs">
                        Secondary
                      </div>
                      <div className="theme-accent-bg p-4 rounded text-white text-center text-xs">
                        Accent
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="theme-surface p-4 rounded text-center text-xs theme-border">
                        Surface
                      </div>
                      <div className="theme-background p-4 rounded text-center text-xs theme-border">
                        Background
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-center text-xs">
                        Default
                      </div>
                    </div>
                  </div>

                  {/* Border Radius Demo */}
                  <div className="theme-card">
                    <h4 className="theme-text-lg theme-font-semibold mb-4">Bordes Redondeados</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="theme-border-radius-sm bg-primary-500 text-white p-4 text-center text-xs">
                        Small
                      </div>
                      <div className="theme-border-radius bg-primary-500 text-white p-4 text-center text-xs">
                        Medium
                      </div>
                      <div className="theme-border-radius-lg bg-primary-500 text-white p-4 text-center text-xs">
                        Large
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="theme-border-radius-xl bg-primary-500 text-white p-4 text-center text-xs">
                        XL
                      </div>
                      <div className="theme-border-radius-2xl bg-primary-500 text-white p-4 text-center text-xs">
                        2XL
                      </div>
                      <div className="theme-border-radius-3xl bg-primary-500 text-white p-4 text-center text-xs">
                        3XL
                      </div>
                    </div>
                  </div>

                  {/* Spacing Demo */}
                  <div className="theme-card">
                    <h4 className="theme-text-lg theme-font-semibold mb-4">Espaciado</h4>
                    <div className="space-y-3">
                      <div className="theme-spacing-xs bg-gray-100 dark:bg-gray-800 rounded">
                        Espaciado XS
                      </div>
                      <div className="theme-spacing-sm bg-gray-100 dark:bg-gray-800 rounded">
                        Espaciado SM
                      </div>
                      <div className="theme-spacing-md bg-gray-100 dark:bg-gray-800 rounded">
                        Espaciado MD
                      </div>
                      <div className="theme-spacing-lg bg-gray-100 dark:bg-gray-800 rounded">
                        Espaciado LG
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-world Example */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  Ejemplo Real de Aplicación
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
                  Observa cómo "Plan Actual" permanece fijo mientras los elementos de chat cambian con el tema.
                </p>
              </div>
              <div className="p-6">
                <ThemeExample />
              </div>
            </div>

            {/* Advanced Cards Demo */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  Cards Avanzadas - Mejor Manejo
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
                  Cards con colapsable, acciones contextuales y múltiples variantes.
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Plan Card */}
                  <PlanCard
                    planName="Plan Profesional"
                    price="$29"
                    features={[
                      "10 usuarios",
                      "100 GB almacenamiento",
                      "Soporte prioritario",
                      "API completa"
                    ]}
                    isActive={true}
                  />

                  {/* Chat Cards */}
                  <ChatCard
                    name="Juan Pérez"
                    lastMessage="Hola, necesito ayuda con mi cuenta"
                    time="12:30"
                    unreadCount={3}
                    avatar="JP"
                  />

                  <ChatCard
                    name="María García"
                    lastMessage="Gracias por la ayuda"
                    time="11:45"
                    unreadCount={0}
                    avatar="MG"
                  />

                  {/* Stats Cards */}
                  <StatsCard
                    title="Usuarios Activos"
                    value="1,234"
                    change={{ value: "12% vs mes pasado", isPositive: true }}
                    icon={<Database className="w-5 h-5" />}
                  />

                  <StatsCard
                    title="Mensajes Hoy"
                    value="5,678"
                    change={{ value: "8% vs mes pasado", isPositive: true }}
                    icon={<Activity className="w-5 h-5" />}
                  />

                  <StatsCard
                    title="Tasa de Respuesta"
                    value="98%"
                    change={{ value: "2% vs mes pasado", isPositive: false }}
                    icon={<Clock className="w-5 h-5" />}
                  />
                </div>

                {/* Advanced Card con acciones personalizadas */}
                <AdvancedCard
                  title="Configuración Avanzada"
                  subtitle="Opciones adicionales de personalización"
                  variant="secondary"
                  size="lg"
                  collapsible={true}
                  actions={[
                    {
                      icon: <SettingsIcon className="w-4 h-4" />,
                      label: "Configurar",
                      onClick: () => console.log("Configurar"),
                    },
                    {
                      icon: <Palette className="w-4 h-4" />,
                      label: "Personalizar",
                      onClick: () => console.log("Personalizar"),
                    },
                    {
                      icon: <Database className="w-4 h-4" />,
                      label: "Exportar",
                      onClick: () => console.log("Exportar"),
                    },
                    {
                      icon: <HelpCircle className="w-4 h-4" />,
                      label: "Ayuda",
                      onClick: () => console.log("Ayuda"),
                    },
                  ]}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Modo Oscuro
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Activa el modo oscuro para mejor visualización en entornos con poca luz.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Notificaciones
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Configura las notificaciones del sistema y alertas importantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </AdvancedCard>
              </div>
            </div>

            {/* WhatsApp Chat Demo */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  Interfaz de Chat Estilo WhatsApp
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
                  Chat completo con diseño WhatsApp, modo oscuro mejorado y personalización total.
                </p>
              </div>
              <div className="p-0">
                <div className="h-[600px]">
                  <WhatsAppChat />
                </div>
              </div>
            </div>

            {/* Otras configuraciones principales */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SettingsIcon className="w-10 h-10 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  Más Configuraciones
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  Otras opciones de configuración estarán disponibles próximamente.
                </p>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            {/* System Status Card */}
            <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] p-6 shadow-lg border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Monitor className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </span>
                Estado del Sistema
              </h3>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Estado</span>
                  <span className={`flex items-center gap-2 font-black text-sm ${settings.systemStatus === 'active' ? 'text-emerald-500' : 'text-secondary-500'}`}>
                    {settings.systemStatus === 'active' ? '● ONLINE' : '○ MANTENIMIENTO'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Versión API</span>
                  <span className="text-slate-900 dark:text-white font-black text-sm">v2.4.92-beta</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Base de Datos</span>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-black text-sm">CONECTADO</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Último Sync</span>
                  <span className="text-slate-900 dark:text-white font-black text-xs uppercase">
                    {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Sparktree Cloud</p>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Tu instancia se está ejecutando de forma óptima. No se han detectado latencias en los últimos 24 meses.
                </p>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-[1.5rem] p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 blur-2xl rounded-full" />

              <h4 className="text-lg font-black mb-4 relative z-10 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-white/20 backdrop-blur-xl rounded-xl">
                  <HelpCircle className="w-5 h-5 text-white" />
                </span>
                ¿Necesitas ayuda?
              </h4>
              <p className="text-primary-100 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                Nuestros expertos en FlowBuilder y Cloud API están disponibles 24/7 para ayudarte a optimizar tus procesos.
              </p>
              <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest relative z-10">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


