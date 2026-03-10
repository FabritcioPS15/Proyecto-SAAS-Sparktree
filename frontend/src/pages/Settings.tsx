import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { mockSettings } from '../data/mockData';
import { getSettings, saveSettings } from '../services/api';

export const Settings = () => {
  const [settings, setSettings] = useState({
    ...mockSettings,
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
        console.error("Failed to load settings, using defaults", err);
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
    return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Configuración</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Ajusta las preferencias y conexiones de tu chatbot</p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden relative">
        <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Bot
              </label>
              <input
                type="text"
                value={settings.botName}
                onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white shadow-sm"
                placeholder="Introduce el nombre del bot"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                URL del Webhook (WhatsApp Cloud API)
              </label>
              <input
                type="url"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white shadow-sm font-mono text-sm"
                placeholder="https://api.midominio.com/webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Estado del Sistema
              </label>
              <select
                value={settings.systemStatus}
                onChange={(e) => setSettings({ ...settings, systemStatus: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white shadow-sm appearance-none cursor-pointer"
              >
                <option value="active">🟢 Activo</option>
                <option value="inactive">🔴 Inactivo</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Integración API de WhatsApp</h3>
             <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Token de Acceso (WhatsApp Token)
              </label>
              <input
                type="password"
                value={settings.whatsappToken}
                onChange={(e) => setSettings({ ...settings, whatsappToken: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 dark:text-white shadow-sm font-mono text-sm"
                placeholder="EAAI..."
              />
              <p className="text-xs text-gray-500 mt-2">Token de acceso permanente o temporal generado en Meta for Developers.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Token de Verificación (Verify Token)
              </label>
              <input
                type="text"
                value={settings.verifyToken}
                onChange={(e) => setSettings({ ...settings, verifyToken: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 dark:text-white shadow-sm font-mono text-sm"
                placeholder="MiTokenSaaS123"
              />
              <p className="text-xs text-gray-500 mt-2">El mismo token configurado en el Webhook de Meta para verificar la conexión.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                ID del Número de Teléfono (Phone Number ID)
              </label>
              <input
                type="text"
                value={settings.phoneNumberId}
                onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 dark:text-white shadow-sm font-mono text-sm"
                placeholder="101234567890123"
              />
              <p className="text-xs text-gray-500 mt-2">Identificador único del número remitente en la API Cloud.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>

            {saved && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-bold">Configuración guardada exitosamente</span>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Información del Sistema</h3>
        <div className="space-y-4 max-w-2xl">
          <div className="flex justify-between items-center py-3 border-b border-gray-200/50 dark:border-gray-700/50 group">
            <span className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Estado Actual</span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
              settings.systemStatus === 'active'
                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                : 'bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-900/40 dark:to-red-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
            }`}>
              {settings.systemStatus === 'active' ? 'En línea' : 'Desconectado'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200/50 dark:border-gray-700/50 group">
            <span className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Versión de API</span>
            <span className="text-gray-900 dark:text-white font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">v2.0.1</span>
          </div>
          <div className="flex justify-between items-center py-3 group">
            <span className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Última Actualización</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
