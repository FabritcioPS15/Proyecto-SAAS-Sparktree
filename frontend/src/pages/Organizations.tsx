import { useState, useEffect } from 'react';
import { Building2, Plus, Search, MoreVertical, Shield, Globe } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Organizations = () => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', plan: 'pro' });

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/organizations`);
      setOrgs(res.data);
    } catch (err) {
      console.error('Error fetching orgs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/organizations`, newOrg);
      setIsModalOpen(false);
      setNewOrg({ name: '', plan: 'pro' });
      fetchOrgs();
    } catch (err) {
      console.error('Error creating org:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Gestión de <span className="text-primary-600 dark:text-primary-400">Organizaciones</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Administra todos los tenantes y empresas del ecosistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nueva Organización
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-[2rem] border border-gray-200 dark:border-gray-800" />)
        ) : (
          orgs.map((org) => (
            <div key={org.id} className="group bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-2xl text-primary-600 dark:text-primary-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{org.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">ID: {org.id.split('-')[0]}...</p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 capitalize">{org.plan} Plan</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Globe className="w-4 h-4 text-primary-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activo</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#11141b] w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Crear Organización</h2>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de Empresa</label>
                  <input 
                    type="text" 
                    required
                    value={newOrg.name}
                    onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                    placeholder="Ej. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Plan del SaaS</label>
                  <select 
                    value={newOrg.plan}
                    onChange={e => setNewOrg({...newOrg, plan: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
