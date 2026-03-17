import { useState, useEffect } from 'react';
import { UserPlus, Search, ShieldCheck, Mail, Building, MoreVertical } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const StaffManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      if (oRes.data.length > 0) {
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

  const getRoleBadge = (role: string) => {
    const common = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ";
    if (role === 'superadmin') return common + "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
    if (role === 'admin') return common + "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
    return common + "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Gestión de <span className="text-primary-600 dark:text-primary-400">Personal</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Controla el acceso de administradores y usuarios al panel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organización</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
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
                      <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#11141b] w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Crear Usuario de Panel</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.full_name}
                    onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email de Acceso</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white"
                    placeholder="juan@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Organización</label>
                  <select 
                    value={newUser.organization_id}
                    onChange={e => setNewUser({...newUser, organization_id: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white"
                  >
                    {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rol</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">SuperAdmin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña</label>
                    <input 
                      type="password" 
                      required
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
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
                    Confirmar
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
