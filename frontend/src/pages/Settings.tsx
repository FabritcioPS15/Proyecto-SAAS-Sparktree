import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { getSettings, saveSettings } from '../services/api';

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
    return (
      <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-5 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800/50 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Configuración <span className="text-slate-400">General</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
              Gestiona la identidad de tu bot, conexiones de API y parámetros globales del sistema.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-4 bg-slate-900 dark:bg-white rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-none">
              <Save className="w-8 h-8 text-white dark:text-slate-900" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-10">
            <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden group">
              <div className="p-8 border-b border-gray-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-transparent">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">🤖</span>
                  Identidad del Chatbot
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                      Nombre del Bot
                    </label>
                    <input
                      type="text"
                      value={settings.botName}
                      onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold"
                      placeholder="Ej. Sparky Lite"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                      Estado Operativo
                    </label>
                    <div className="relative group">
                      <select
                        value={settings.systemStatus}
                        onChange={(e) => setSettings({ ...settings, systemStatus: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer"
                      >
                        <option value="active">🟢 Sistema Activo</option>
                        <option value="inactive">🔴 En Mantenimiento</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Webhook Principal URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-mono text-xs font-bold"
                      placeholder="https://..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-400 shadow-sm">
                      HTTPS ONLY
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                      <span className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">🌐</span>
                      WhatsApp Cloud API
                    </h3>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">Conectado</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={settings.whatsappToken}
                        onChange={(e) => setSettings({ ...settings, whatsappToken: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-mono text-sm"
                        placeholder="••••••••••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                        Verify Token
                      </label>
                      <input
                        type="text"
                        value={settings.verifyToken}
                        onChange={(e) => setSettings({ ...settings, verifyToken: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-mono text-sm"
                        placeholder="VerifyKey123"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={settings.phoneNumberId}
                      onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold"
                      placeholder="10XXXXXXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-10 border-t border-slate-100 dark:border-slate-800/50">
                  <button
                    type="submit"
                    className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                  >
                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Guardar Configuración
                  </button>

                  {saved && (
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-6 py-4 rounded-[1.5rem] animate-in fade-in zoom-in duration-500">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-sm font-black uppercase tracking-wider">¡Éxito! Cambios aplicados</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
                <span className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">📊</span>
                Estado del Sistema
              </h3>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Estado</span>
                  <span className={`flex items-center gap-2 font-black text-sm ${settings.systemStatus === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {settings.systemStatus === 'active' ? '● ONLINE' : '○ MANTENIMIENTO'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Versión API</span>
                  <span className="text-slate-900 dark:text-white font-black">v2.4.92-beta</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Base de Datos</span>
                  <span className="text-emerald-500 font-black">● CONECTADO</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Último Sync</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xs uppercase">
                    {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    ✨
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Sparktree Cloud</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Tu instancia se está ejecutando de forma óptima. No se han detectado latencias en los últimos 24 meses.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />

              <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight">¿Necesitas ayuda?</h4>
              <p className="text-indigo-100 text-sm font-medium mb-8 relative z-10 leading-relaxed">
                Nuestros expertos en FlowBuilder y Cloud API están disponibles 24/7 para ayudarte a optimizar tus procesos.
              </p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest relative z-10">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
