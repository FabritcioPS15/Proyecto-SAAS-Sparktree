import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageBody } from '../../../components/layout/PageBody';
import { Settings as SettingsIcon, Save, CheckCircle, User, Lock, Bell, Globe } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    language: 'es',
    timezone: 'America/Lima',
    emailNotifications: true,
    pushNotifications: true
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setProfile(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save process since there's no backend API for it right now
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full space-y-1 animate-in fade-in duration-500 flex flex-col">
      <PageHeader
        title="Configuración de Perfil"
        highlight="Ajustes"
        description="Gestiona tu información personal, preferencias y seguridad de tu cuenta."
        icon={SettingsIcon}
      />

      <PageBody>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            
            {/* Información Personal */}
            <div className="bg-white dark:bg-dark-card/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Información Personal</h3>
                  <p className="text-xs text-slate-500">Actualiza tus datos básicos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full px-4 py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rol en el sistema</label>
                  <input
                    type="text"
                    disabled
                    value={user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Preferencias Globales */}
            <div className="bg-white dark:bg-dark-card/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preferencias Regionales</h3>
                  <p className="text-xs text-slate-500">Ajusta el idioma y zona horaria de tu sesión</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Idioma de la Interfaz</label>
                  <select
                    name="language"
                    value={profile.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Zona Horaria</label>
                  <select
                    name="timezone"
                    value={profile.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                  >
                    <option value="America/Lima">Lima (GMT-5)</option>
                    <option value="America/Bogota">Bogotá (GMT-5)</option>
                    <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  </select>
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
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95'
                }`}
              >
                {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                {saved ? 'Cambios Guardados' : 'Guardar Perfil'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Seguridad */}
            <div className="bg-white dark:bg-dark-card/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Seguridad</h3>
                  <p className="text-xs text-slate-500">Protege el acceso a tu cuenta</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="button"
                  className="w-full py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:border-amber-500/50 transition-colors text-center"
                >
                  Cambiar Contraseña
                </button>
                <button 
                  type="button"
                  className="w-full py-3 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:border-amber-500/50 transition-colors text-center"
                >
                  Autenticación en 2 Pasos
                </button>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white dark:bg-dark-card/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notificaciones</h3>
                  <p className="text-xs text-slate-500">Gestiona las alertas que recibes</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Correos Promocionales</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="emailNotifications"
                      className="peer sr-only" 
                      checked={profile.emailNotifications}
                      onChange={handleChange}
                    />
                    <div className="block bg-slate-200 dark:bg-slate-700 w-10 h-6 rounded-full transition-colors peer-checked:bg-purple-500"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Alertas de Sistema</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="pushNotifications"
                      className="peer sr-only" 
                      checked={profile.pushNotifications}
                      onChange={handleChange}
                    />
                    <div className="block bg-slate-200 dark:bg-slate-700 w-10 h-6 rounded-full transition-colors peer-checked:bg-purple-500"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </form>
      </PageBody>
    </div>
  );
};


