import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/api';
import { RiRobot2Line } from "react-icons/ri";
import { WhatsAppNumbersManager } from '../components/settings/WhatsAppNumbersManager';

import { PageHeader } from '../components/layout/PageHeader';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';
import { Settings as SettingsIcon, Save, CheckCircle, ChevronDown } from 'lucide-react';

export const Settings = () => {
  const [settings, setSettings] = useState({
    botName: '',
    systemStatus: 'inactive',
    webhookUrl: '',
    whatsappToken: '',
    verifyToken: '',
    phoneNumberId: ''
  });
  const [saved, setSaved] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings", error);
    }
  };

  if (loading) {
    return <PageLoader sectionName="Configuración" />;
  }

  return (
    <div className="h-full space-y-1 animate-in fade-in duration-500 flex flex-col">
      <PageHeader
        title="Configuración"
        highlight="General"
        description="Gestiona la identidad de tu bot, conexiones de API y parámetros globales del sistema."
        icon={SettingsIcon}
      />

      <PageBody>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            
            {/* Identidad del Bot */}
            <div className="bg-white dark:bg-[#11141b]/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-500/10 rounded-lg text-accent-500">
                  <RiRobot2Line size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Identidad del Bot</h3>
                  <p className="text-xs text-slate-500">Personaliza cómo se identifica tu asistente</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Asistente</label>
                  <input
                    type="text"
                    name="botName"
                    value={settings.botName}
                    onChange={handleChange}
                    placeholder="Ej. Sparky Bot"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Webhook URL</label>
                  <input
                    type="text"
                    name="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={handleChange}
                    placeholder="https://tu-dominio.com/webhook"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Configuración Cloud API */}
            <div className="bg-white dark:bg-[#11141b]/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp Cloud API</h3>
                  <p className="text-xs text-slate-500">Credenciales de conexión oficial de Meta</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number ID</label>
                    <input
                      type="text"
                      name="phoneNumberId"
                      value={settings.phoneNumberId}
                      onChange={handleChange}
                      placeholder="Identificador numérico"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verify Token</label>
                    <input
                      type="password"
                      name="verifyToken"
                      value={settings.verifyToken}
                      onChange={handleChange}
                      placeholder="Token para Webhook"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Token (Permanent)</label>
                  <input
                    type="password"
                    name="whatsappToken"
                    value={settings.whatsappToken}
                    onChange={handleChange}
                    placeholder="EAAG..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saved}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  saved 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 cursor-default' 
                  : 'bg-accent-500 text-black hover:shadow-xl hover:shadow-accent-500/20 active:scale-95'
                }`}
              >
                {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                {saved ? 'Configuración Guardada' : 'Guardar Cambios'}
              </button>
            </div>

            {/* Gestión de Números WhatsApp */}
            <div className="bg-white dark:bg-[#11141b]/50 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
              <WhatsAppNumbersManager />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#11141b]/50 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                <span className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">📊</span>
                Estado del Sistema
              </h3>

              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Estado</span>
                  <span className={`flex items-center gap-2 font-black text-sm ${settings.systemStatus === 'active' ? 'text-emerald-500' : 'text-secondary-500'}`}>
                    {settings.systemStatus === 'active' ? '● ONLINE' : '○ MANTENIMIENTO'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Versión API</span>
                  <span className="text-slate-900 dark:text-white font-black text-sm uppercase">v2.4.92-beta</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Base de Datos</span>
                  <span className="text-emerald-500 font-black text-sm">● CONECTADO</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Último Sync</span>
                  <span className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tight">
                    {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                    ✨
                  </div>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Sparktree Cloud</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Tu instancia se está ejecutando de forma óptima. No se han detectado latencias.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 blur-3xl rounded-full" />

              <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight">¿Necesitas ayuda?</h4>
              <p className="text-slate-400 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                Nuestros expertos en FlowBuilder y Cloud API están disponibles 24/7 para ayudarte a optimizar tus procesos.
              </p>
              <button 
                type="button"
                className="w-full py-4 bg-accent-500 text-black rounded-2xl font-black shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all text-[10px] uppercase tracking-widest relative z-10"
              >
                Contactar Soporte
              </button>
            </div>
          </div>
        </form>
      </PageBody>
    </div>
  );
};

