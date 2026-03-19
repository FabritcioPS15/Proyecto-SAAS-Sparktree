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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#11141b]/50 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="p-2.5 bg-primary-100 dark:bg-primary-500/10 rounded-xl"><RiRobot2Line className="w-5 h-5 text-primary-600 dark:text-primary-400" /></span>
                  Identidad del Chatbot
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Nombre del Bot
                    </label>
                    <input
                      type="text"
                      value={settings.botName}
                      onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-bold"
                      placeholder="Ej. Sparky Lite"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Estado Operativo
                    </label>
                    <div className="relative group">
                      <select
                        value={settings.systemStatus}
                        onChange={(e) => setSettings({ ...settings, systemStatus: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer"
                      >
                        <option value="active">🟢 Sistema Activo</option>
                        <option value="inactive">🔴 En Mantenimiento</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    Webhook Principal URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-mono text-xs font-bold"
                      placeholder="https://..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-[8px] font-black uppercase text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600">
                      HTTPS ONLY
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl font-bold">🌐</div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">WhatsApp Cloud API</h4>
                    </div>
                    <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">Conectado</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={settings.whatsappToken}
                        onChange={(e) => setSettings({ ...settings, whatsappToken: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-mono text-sm"
                        placeholder="••••••••••"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        Verify Token
                      </label>
                      <input
                        type="text"
                        value={settings.verifyToken}
                        onChange={(e) => setSettings({ ...settings, verifyToken: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-mono text-sm font-bold"
                        placeholder="VerifyKey123"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={settings.phoneNumberId}
                      onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 dark:text-white font-bold"
                      placeholder="10XXXXXXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800/50">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                  >
                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">Guardar Configuración</span>
                  </button>

                  {saved && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-5 py-3 rounded-2xl animate-in fade-in zoom-in duration-500 border border-emerald-100 dark:border-emerald-500/20">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">¡Éxito! Cambios aplicados</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Gestión de Números WhatsApp */}
            <div className="bg-white dark:bg-[#11141b]/50 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
              <WhatsAppNumbersManager />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#11141b]/50 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
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

              <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                    ✨
                  </div>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Sparktree Cloud</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Tu instancia se está ejecutando de forma óptima. No se han detectado latencias en los últimos 24 meses.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-[2.5rem] p-8 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 blur-3xl rounded-full" />

              <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight">¿Necesitas ayuda?</h4>
              <p className="text-primary-100 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                Nuestros expertos en FlowBuilder y Cloud API están disponibles 24/7 para ayudarte a optimizar tus procesos.
              </p>
              <button className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all text-[10px] uppercase tracking-widest relative z-10">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </PageBody>
    </div>
  );
};
