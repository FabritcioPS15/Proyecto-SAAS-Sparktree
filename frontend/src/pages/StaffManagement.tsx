import { useState, useEffect } from 'react';
import { UserPlus, Mail, Building, Crown, Clock, User, Lock, Info, Trash2 } from 'lucide-react';
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
  const [showRolesInfo, setShowRolesInfo] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'admin',
    organization_id: '',
    password: 'password123'
  });

  // Funciones para datos de usuarios (similar a Clients)
  const getUserRole = (user: any) => {
    // Mapeo real de roles basado en el rol del usuario
    const roleMapping: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Administrador',
      'empresa': 'Empresa',
      'staff': 'Staff',
      'agent': 'Agente'
    };
    return roleMapping[user.role] || 'Staff';
  };

  const getRoleDescription = (role: string) => {
    const descriptions: { [key: string]: string } = {
      'super_admin': 'Acceso total al sistema, gestión de todas las organizaciones y configuración global',
      'admin': 'Gestión completa de usuarios, configuración de organización y acceso a todas las herramientas',
      'empresa': 'Acceso a datos de empresa, gestión de clientes y reportes de negocio',
      'staff': 'Soporte técnico, gestión de flujos y atención a usuarios finales',
      'agent': 'Atención básica a clientes, acceso limitado a herramientas de comunicación'
    };
    return descriptions[role] || 'Acceso básico al sistema';
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'super_admin': 'bg-black text-white dark:bg-white dark:text-black shadow-lg',
      'admin': 'bg-accent-500 text-black shadow-lg shadow-accent-500/30',
      'empresa': 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
      'staff': 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
      'agent': 'bg-slate-500 text-white shadow-lg'
    };
    return colors[role] || 'bg-slate-500 text-white';
  };

  const getUserUsageTime = (user: any) => {
    if (!user.created_at) return { hours: 0, days: 0 };
    const createdDate = new Date(user.created_at);
    const now = new Date();
    const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
    const daysDiff = Math.floor(hoursDiff / 8);
    return { hours: hoursDiff, days: daysDiff };
  };

  const getUserRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'admin': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'staff': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'viewer': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getOrganizationName = (orgId: string) => {
    const org = orgs.find(o => o.id === orgId);
    return org?.name || 'Sin organización';
  };

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


  if (loading) {
    return <PageLoader sectionName="Usuarios" />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gestión de"
        highlight="Usuarios"
        description="Administra el equipo de usuarios y sus roles dentro de las organizaciones."
        icon={UserPlus}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-xl p-0 border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowRolesInfo(true)}
              className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all border border-slate-200 dark:border-slate-700"
              title="Información de Roles"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 h-11 bg-black dark:bg-accent-500 text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
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
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiempo de Uso</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loading ? (
                    [1, 2, 3].map(i => <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" /></td>
                    </tr>)
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-500/10 dark:bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-600 dark:text-accent-400 font-black">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{user.full_name || 'Sin nombre'}</p>
                              <p className="text-xs text-gray-400 font-bold">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${getUserRoleColor(getUserRole(user))}`}>
                              <Crown className="w-3 h-3 mr-1" />
                              {getUserRole(user)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                              {getOrganizationName(user.organization_id)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {getUserUsageTime(user).hours}h
                              </span>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              {getUserUsageTime(user).days} días
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-gray-400 hover:text-accent-500 transition-colors"
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
              [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-[2rem]" />)
            ) : (
              users.map((user) => (
                <div key={user.id} className="group bg-white dark:bg-[#11141b] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-accent-500/10 transition-colors" />

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-black rounded-2xl flex items-center justify-center text-accent-500 text-xl font-black shadow-lg shadow-accent-500/10 group-hover:scale-105 transition-transform duration-500">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white truncate pr-2 leading-tight">
                        {user.full_name || 'Personal Sparktree'}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate opacity-70">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 relative z-10 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm ${getUserRoleColor(getUserRole(user))}`}>
                        <Crown className="w-3 h-3 mr-1.5 inline shadow-sm" />
                        {getUserRole(user)}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-white/2 p-3 rounded-2xl border border-slate-100/50 dark:border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Building className="w-3.5 h-3.5" />
                          <span>Empresa</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">
                          {getOrganizationName(user.organization_id)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Activo</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                          {getUserUsageTime(user).days} días
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-gray-800/50 relative z-10">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="flex-1 h-10 bg-slate-900 dark:bg-white/5 text-white dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-accent-500 dark:hover:text-black transition-all shadow-sm active:scale-95"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </PageBody>

      {/* Unified User Modal (Create/Edit) */}
      {(isModalOpen || editingUser) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f1115] w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

            <div className="p-8 relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-accent-500/10 rounded-2xl text-accent-500 shadow-lg shadow-accent-500/10">
                  {editingUser ? <SettingsIcon className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {editingUser ? 'Actualiza los permisos y datos del perfil' : 'Registra un nuevo colaborador en el sistema'}
                  </p>
                </div>
              </div>

              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={editingUser ? editingUser.full_name : newUser.full_name}
                      onChange={e => editingUser
                        ? setEditingUser({ ...editingUser, full_name: e.target.value })
                        : setNewUser({ ...newUser, full_name: e.target.value })
                      }
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60"
                      placeholder="Ej. Juan Pérez"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email Corporativo</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={!!editingUser}
                      value={editingUser ? editingUser.email : newUser.email}
                      onChange={e => !editingUser && setNewUser({ ...newUser, email: e.target.value })}
                      className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60 ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="juan@sparktree.com"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Rol</label>
                    <select
                      value={editingUser ? editingUser.role : newUser.role}
                      onChange={e => editingUser
                        ? setEditingUser({ ...editingUser, role: e.target.value })
                        : setNewUser({ ...newUser, role: e.target.value })
                      }
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 transition-all"
                    >
                      <option value="agent">Agente</option>
                      <option value="staff">Staff</option>
                      <option value="empresa">Empresa</option>
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Sistema</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Organización</label>
                    <select
                      value={editingUser ? (editingUser.organization_id || '') : (newUser.organization_id || '')}
                      onChange={e => editingUser
                        ? setEditingUser({ ...editingUser, organization_id: e.target.value })
                        : setNewUser({ ...newUser, organization_id: e.target.value })
                      }
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 transition-all"
                    >
                      <option value="">Global</option>
                      {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                  </div>
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contraseña Temporal</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60"
                        placeholder="••••••••"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 py-3.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700 transition-colors rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25"
                  >
                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Roles Info Modal */}
      {showRolesInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f1115] w-full max-w-lg rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl rounded-full -mr-12 -mt-12" />

            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500 shadow-lg shadow-accent-500/10">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Roles del Sistema
                  </h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Niveles de acceso disponibles
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { role: 'super_admin', title: 'Super Admin', desc: 'Acceso total al sistema', perms: ['Global', 'Todas las orgs', 'Config'] },
                  { role: 'admin', title: 'Administrador', desc: 'Gestión completa de organización', perms: ['Usuarios', 'Config', 'Reportes'] },
                  { role: 'empresa', title: 'Empresa', desc: 'Acceso a datos de negocio', perms: ['Clientes', 'Reportes', 'Campañas'] },
                  { role: 'staff', title: 'Staff', desc: 'Soporte técnico y flujos', perms: ['Soporte', 'Flujos', 'Usuarios'] },
                  { role: 'agent', title: 'Agente', desc: 'Atención básica a clientes', perms: ['Chat', 'Atención', 'Básico'] }
                ].map((roleInfo) => (
                  <div key={roleInfo.role} className="bg-slate-50 dark:bg-white/2 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg text-white text-[10px] font-black uppercase tracking-widest ${getRoleColor(roleInfo.role)}`}>
                        {roleInfo.title.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1 truncate">{roleInfo.title}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">{roleInfo.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {roleInfo.perms.map((perm, idx) => (
                            <span key={idx} className="text-[8px] px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowRolesInfo(false)}
                  className="w-full py-3 bg-accent-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
