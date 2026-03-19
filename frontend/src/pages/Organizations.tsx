import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Shield } from 'lucide-react';
import axios from 'axios';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Organizations = () => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', plan: 'pro' });

  const [editingOrg, setEditingOrg] = useState<any>(null);

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

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/admin/organizations/${editingOrg.id}`, editingOrg);
      setEditingOrg(null);
      fetchOrgs();
    } catch (err) {
      console.error('Error updating org:', err);
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta organización? Todos los datos asociados se perderán.')) return;
    try {
      await axios.delete(`${API_URL}/admin/organizations/${id}`);
      fetchOrgs();
    } catch (err) {
      console.error('Error deleting org:', err);
    }
  };

  if (loading) {
    return <PageLoader sectionName="Organizaciones" />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de"
        highlight="Organizaciones"
        description="Administra todos los tenantes y empresas del ecosistema."
        icon={Building2}
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nueva Organización
          </button>
        }
      />

      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-[2rem] border border-gray-200 dark:border-gray-800" />)
          ) : (
            orgs.map((org) => (
              <div key={org.id} className="group bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-2xl hover:border-primary-500/30 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-2xl text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => setEditingOrg(org)}
                      className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4 rotate-45" /> {/* Use Plus rotated for edit or just text/icon */}
                      <span className="sr-only">Editar</span>
                      <Search className="w-4 h-4" /> {/* Actually let's use a real edit icon or more dots */}
                    </button>
                    <button 
                      onClick={() => handleDeleteOrg(org.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4 rotate-45 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{org.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">UUID: {org.id.split('-')[0]}...</p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 relative z-10">
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{org.plan} Plan</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activo</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PageBody>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141b] w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Configurar Nueva Organización</h2>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nombre de Empresa</label>
                  <input 
                    type="text" 
                    required
                    value={newOrg.name}
                    onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                    placeholder="Ej. Sparktree Studios"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Plan de Suscripción</label>
                  <select 
                    value={newOrg.plan}
                    onChange={e => setNewOrg({...newOrg, plan: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="free">Starter (Free)</option>
                    <option value="pro">Growth (Pro)</option>
                    <option value="enterprise">Global (Enterprise)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-95"
                  >
                    Crear Ahora
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingOrg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141b] w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Editar Organización</h2>
              <form onSubmit={handleUpdateOrg} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nombre de Empresa</label>
                  <input 
                    type="text" 
                    required
                    value={editingOrg.name}
                    onChange={e => setEditingOrg({...editingOrg, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Plan de Suscripción</label>
                  <select 
                    value={editingOrg.plan}
                    onChange={e => setEditingOrg({...editingOrg, plan: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="free">Starter (Free)</option>
                    <option value="pro">Growth (Pro)</option>
                    <option value="enterprise">Global (Enterprise)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingOrg(null)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-95"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
