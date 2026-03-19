import { useState, useEffect } from 'react';
import { UserPlus, Mail, Building } from 'lucide-react';
import axios from 'axios';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';
import { Settings as SettingsIcon, LayoutGrid, List } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const StaffManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [newUser, setNewUser] = useState({ 
    email: '', 
    full_name: '', 
    role: 'admin', 
    organization_id: '',
    password: 'password123'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/admin/organizations`)
      ]);
      setUsers(uRes.data);
      setOrgs(oRes.data);
      if (oRes.data.length > 0 && !newUser.organization_id) {
        setNewUser(prev => ({ ...prev, organization_id: oRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/users`, newUser);
      setIsModalOpen(false);
      setNewUser({ ...newUser, email: '', full_name: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/admin/users/${editingUser.id}`, editingUser);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const common = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ";
    if (role === 'super_admin') return common + "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
    if (role === 'admin') return common + "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
    if (role === 'empresa') return common + "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400";
    if (role === 'staff') return common + "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400";
    return common + "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400";
  };

  if (loading) {
    return <PageLoader sectionName="Personal" />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de"
        highlight="Personal"
        description="Controla el acceso de administradores y usuarios al panel."
        icon={UserPlus}
        action={
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-400'}`}
                title="Vista de Tabla"
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-400'}`}
                title="Vista de Tarjetas"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </div>
        }
      />

      <PageBody>
        {viewMode === 'table' ? (
          <div className="bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organización</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" /></td>
                    </tr>)
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 font-black">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{user.full_name || 'Sin nombre'}</p>
                              <p className="text-xs text-gray-400 font-bold">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={getRoleBadge(user.role)}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                              {user.organizations?.name || 'Global'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                            >
                              <SettingsIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Mail className="w-4 h-4 text-red-400 rotate-45" /> {/* Close enough to an X */}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-[2rem]" />)
            ) : (
              users.map((user) => (
                <div key={user.id} className="group bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary-500/20">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{user.full_name || 'Personal Sparktree'}</h3>
                      <p className="text-xs text-gray-500 font-medium truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-700/50">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{user.organizations?.name || 'Global'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="flex-1 py-2.5 bg-gray-50 dark:bg-gray-800 font-bold text-xs text-gray-600 dark:text-gray-300 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                    >
                      Editar Perfil
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Mail className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </PageBody>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141b] w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Registrar Nuevo Personal</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.full_name}
                    onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Corporativo</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10"
                    placeholder="juan@sparktree.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Rol de Acceso</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="agent">Agente (Colaborador)</option>
                      <option value="staff">Staff</option>
                      <option value="empresa">Empresa</option>
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Sistema</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Organización</label>
                    <select 
                      value={newUser.organization_id || ''}
                      onChange={e => setNewUser({...newUser, organization_id: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">Ninguna (Global)</option>
                      {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Contraseña Temporal</label>
                  <input 
                    type="password" 
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141b] w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Editar Perfil de Personal</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.full_name}
                    onChange={e => setEditingUser({...editingUser, full_name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Rol</label>
                    <select 
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                    >
                      <option value="agent">Agente (Colaborador)</option>
                      <option value="staff">Staff</option>
                      <option value="empresa">Empresa</option>
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Sistema</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Organización</label>
                    <select 
                      value={editingUser.organization_id || ''}
                      onChange={e => setEditingUser({...editingUser, organization_id: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-bold text-gray-900 dark:text-white"
                    >
                      <option value="">Ninguna (Global)</option>
                      {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    Anular
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                  >
                    Guardar Cambios
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
