import { useState, useEffect } from 'react';
import { UserPlus, Mail, Building, Crown, Clock, User, Lock, Info, Trash2, Settings as SettingsIcon, Search } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { PageLoader } from '../../../components/layout/PageLoader';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { useNotifications } from '../../../contexts/NotificationContext';
import { adminService } from '../../../services/adminService';
import { SystemUser, Organization, CreateUserDTO, UserRole } from '../../../types/admin';

export const StaffManagement = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showRolesInfo, setShowRolesInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newUser, setNewUser] = useState<CreateUserDTO>({
    email: '',
    full_name: '',
    role: 'admin',
    organization_id: '',
    password: 'password123'
  });
  const { addNotification } = useNotifications();

  // Funciones para datos de usuarios (similar a Clients)
  const getUserRole = (user: SystemUser) => {
    // Mapeo real de roles basado en el rol del usuario
    const roleMapping: { [key in UserRole]?: string } = {
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
    return descriptions[role] || 'Acceso bÃ¡sico al sistema';
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

  const getUserUsageTime = (user: SystemUser) => {
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
      case 'viewer': return 'text-slate-600 border-slate-200';
      default: return 'text-slate-600 border-slate-200';
    }
  };

  const getOrganizationName = (orgId: string | null) => {
    if (!orgId) return 'Global';
    const org = orgs.find(o => o.id === orgId);
    return org?.name || 'Sin organizaciÃ³n';
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getOrganizations()
      ]);
      setUsers(Array.isArray(uRes) ? uRes : []);
      setOrgs(Array.isArray(oRes) ? oRes : []);
      const orgs = Array.isArray(oRes) ? oRes : [];
      if (orgs.length > 0 && !newUser.organization_id) {
        setNewUser(prev => ({ ...prev, organization_id: oRes[0].id }));
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
      await adminService.createUser(newUser);
      addNotification({ type: 'success', title: 'Usuario creado', message: `"${newUser.full_name}" fue agregado al equipo.` });
      setIsModalOpen(false);
      setNewUser({ ...newUser, email: '', full_name: '' });
      fetchData();
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo crear el usuario.' });
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser.id, {
        full_name: editingUser.full_name || undefined,
        role: editingUser.role,
        organization_id: editingUser.organization_id,
        password: editingUser.password_hash
      });
      addNotification({ type: 'success', title: 'Usuario actualizado', message: `"${editingUser.full_name}" fue actualizado correctamente.` });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo actualizar el usuario.' });
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await adminService.deleteUser(id);
      addNotification({ type: 'success', title: 'Usuario eliminado', message: 'El usuario fue eliminado del sistema.' });
      fetchData();
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el usuario.' });
      console.error('Error deleting user:', err);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    {
      key: 'user',
      header: 'Usuario',
      render: (_: any, user: SystemUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 font-black">
            {user.full_name?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{user.full_name || 'Sin nombre'}</div>
            <div className="text-xs text-gray-400 font-bold">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Rol',
      render: (_: any, user: SystemUser) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getUserRoleColor(getUserRole(user))}`}>
          <Crown className="w-2.5 h-2.5" />
          {getUserRole(user)}
        </span>
      )
    },
    {
      key: 'org',
      header: 'Organización',
      render: (_: any, user: SystemUser) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Building className="w-3.5 h-3.5" />
          <span className="font-medium">
            {getOrganizationName(user.organization_id)}
          </span>
        </div>
      )
    },
    {
      key: 'time',
      header: 'Tiempo de Uso',
      render: (_: any, user: SystemUser) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">
            {getUserUsageTime(user).days}d
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-center',
      render: (_: any, user: SystemUser) => (
        <div className="flex items-center gap-1 justify-center">
          <button
            onClick={() => setEditingUser(user)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"
            title="Editar"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  if (loading) return <PageLoader sectionName="Usuarios" />;

  return (
    <PageContainer>
      <PageHeader
        title="Gestión de"
        highlight="Usuarios"
        description="Administra el equipo de usuarios y sus roles dentro de las organizaciones."
        icon={UserPlus}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRolesInfo(true)}
              className="p-2.5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all border border-slate-200 dark:border-slate-700"
              title="Información de Roles"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>
        }
      />

      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                value={roleFilter}
                onChange={(v) => setRoleFilter(v)}
                options={[
                  { value: 'all', label: 'Todos los roles' },
                  { value: 'super_admin', label: 'Super Admin' },
                  { value: 'admin', label: 'Administrador' },
                  { value: 'empresa', label: 'Empresa' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'agent', label: 'Agente' },
                ]}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedUsers}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        </div>
      </PageBody>

      {/* Unified User Modal (Create/Edit) */}
      <Modal
        open={isModalOpen || !!editingUser}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        icon={<div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">{editingUser ? <SettingsIcon className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}</div>}
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
              className="flex-1 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              Cancelar
            </button>
            <button type="submit" form="staff-form"
              className="flex-1 h-11 bg-gradient-to-r from-accent-500 to-emerald-500 hover:from-accent-600 hover:to-emerald-600 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md">
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        }
      >
        <form id="staff-form" onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre Completo <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="text" required value={editingUser ? (editingUser.full_name ?? '') : newUser.full_name}
                onChange={e => editingUser ? setEditingUser({ ...editingUser, full_name: e.target.value }) : setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full h-10 px-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-slate-400"
                placeholder="Ej. Juan Pérez" />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Corporativo <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="email" required disabled={!!editingUser}
                value={editingUser ? editingUser.email : newUser.email}
                onChange={e => !editingUser && setNewUser({ ...newUser, email: e.target.value })}
                className={`w-full h-10 px-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-slate-400 ${editingUser ? 'opacity-50' : ''}`}
                placeholder="juan@sparktree.com" />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rol</label>
              <Dropdown
                value={editingUser ? editingUser.role : newUser.role}
                onChange={v => editingUser ? setEditingUser({ ...editingUser, role: v as UserRole }) : setNewUser({ ...newUser, role: v as UserRole })}
                options={[
                  { value: 'agent', label: 'Agente' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'empresa', label: 'Empresa' },
                  { value: 'admin', label: 'Administrador' },
                  { value: 'super_admin', label: 'Sistema' },
                ]}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Organización</label>
              <Dropdown
                value={editingUser ? (editingUser.organization_id || '') : (newUser.organization_id || '')}
                onChange={v => editingUser ? setEditingUser({ ...editingUser, organization_id: v }) : setNewUser({ ...newUser, organization_id: v })}
                placeholder="Global"
                options={orgs.map(org => ({ value: org.id, label: org.name }))}
              />
            </div>
          </div>
          {!editingUser && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contraseña Temporal <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full h-10 px-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••" />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Roles Info Modal */}
      <Modal
        open={showRolesInfo}
        onClose={() => setShowRolesInfo(false)}
        title="Roles del Sistema"
        size="lg"
        icon={<div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"><Info className="w-5 h-5 text-black" /></div>}
        footer={
          <button onClick={() => setShowRolesInfo(false)}
            className="w-full h-11 bg-gradient-to-r from-accent-500 to-emerald-500 hover:from-accent-600 hover:to-emerald-600 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md">
            Entendido
          </button>
        }
      >
        <div className="space-y-3">
          {[
            { role: 'super_admin', title: 'Super Admin', desc: 'Acceso total al sistema', perms: ['Global', 'Todas las orgs', 'Config'] },
            { role: 'admin', title: 'Administrador', desc: 'Gestión completa de organización', perms: ['Usuarios', 'Config', 'Reportes'] },
            { role: 'empresa', title: 'Empresa', desc: 'Acceso a datos de negocio', perms: ['Clientes', 'Reportes', 'Campañas'] },
            { role: 'staff', title: 'Staff', desc: 'Soporte técnico y flujos', perms: ['Soporte', 'Flujos', 'Usuarios'] },
            { role: 'agent', title: 'Agente', desc: 'Atención básica a clientes', perms: ['Chat', 'Atención', 'Básico'] }
          ].map((roleInfo) => (
            <div key={roleInfo.role} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white text-xs font-black uppercase tracking-widest ${getRoleColor(roleInfo.role)}`}>
                  {roleInfo.title.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{roleInfo.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{roleInfo.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roleInfo.perms.map((perm, idx) => (
                      <span key={idx} className="text-[9px] px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </PageContainer>
  );
};

