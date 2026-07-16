import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Trash2, Phone, UserCheck, CheckSquare, Square, MessageSquare, Zap, UserPlus, Eye, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, deleteUsersBulk } from '../../../services/api';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { PageLoader } from '../../../components/layout/PageLoader';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { ViewToggle, ViewMode } from '../../../components/ui/ViewToggle';
import { TableCard } from '../../../components/ui/TableCard';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { TableActions } from '../../../components/ui/TableActions';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

type SortField = 'phoneNumber' | 'firstInteraction' | 'lastInteraction' | 'totalMessages' | 'attendedBy' | 'usageTime';
type SortOrder = 'asc' | 'desc';

export const Clients = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('lastInteraction');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterChannel, setFilterChannel] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    setLoading(true);
    getUsers()
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to fetch users', err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(confirmDelete.id);
        return next;
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('No se pudo eliminar el cliente. Vuelve a intentarlo.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteUsersBulk(Array.from(selectedIds));
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error deleting users bulk:', err);
      alert('Error al eliminar masivamente. Algunos clientes podrían no haberse borrado.');
    } finally {
      setConfirmBulkDelete(false);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.attendedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = filterChannel === 'all' || (user.channels && Object.keys(user.channels).includes(filterChannel));
    return matchesSearch && matchesChannel;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <PageLoader sectionName="Directorio" />;

  const columns: Column<any>[] = [
    {
      key: 'phoneNumber',
      header: 'Cliente',
      render: (_: any, user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/10 text-accent-500 flex items-center justify-center font-black text-[10px]">
            {user.phoneNumber.slice(-2)}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block leading-none">{user.phoneNumber}</span>
            <span className="text-[10px] text-accent-500 flex items-center gap-1 mt-1">
              <MessageSquare className="w-2.5 h-2.5" /> Ir al chat
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'attendedBy',
      header: 'Atendido por',
      render: (_: any, user: any) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          {user.botState === 'handoff' ? (
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span className="font-medium">{user.attendedBy}</span>
        </div>
      )
    },
    {
      key: 'channels',
      header: 'Canales',
      render: (_: any, user: any) => (
        <div className="flex gap-1">
          {user.channels && Object.keys(user.channels).length > 0 ? (
            Object.keys(user.channels).map((channel) => (
              <span key={channel} className="px-2 py-1 bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold uppercase">
                {channel}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-[10px]">-</span>
          )}
        </div>
      )
    },
    {
      key: 'serviceNumber',
      header: 'Línea',
      render: (_: any, user: any) => (
        <div className="flex items-center gap-2 text-slate-500 uppercase text-[10px] font-bold">
          <Phone className="w-3.5 h-3.5 opacity-50" />
          <span>{user.serviceNumber || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'lastInteraction',
      header: 'Última vez',
      render: (_: any, user: any) => (
        <span className="text-slate-500 text-xs">{formatDate(user.lastInteraction)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-center',
      render: (_: any, user: any) => (
        <TableActions
          actions={[
            { icon: <Eye className="w-4 h-4" />, label: 'Ver Chat', onClick: (e) => { e.stopPropagation(); navigate('/conversations'); }, tooltip: 'Ver Chat' },
            { icon: <Trash2 className="w-4 h-4" />, label: 'Eliminar', onClick: (e) => { e.stopPropagation(); setConfirmDelete({ id: user.id }); }, variant: 'danger', tooltip: 'Eliminar Cliente' },
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Directorio de"
        highlight="Clientes"
        description="Gestión integral de interacciones."
        icon={User}
        action={
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="flex items-center gap-2 px-4 h-10 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar ({selectedIds.size})
              </button>
            )}
            <div className="bg-gray-50 dark:bg-dark-card px-4 h-10 flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total: {users.length}</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
              <UserPlus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        }
      />

      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar por número o agente..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={filterChannel}
                onChange={(v) => { setFilterChannel(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los Canales' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'messenger', label: 'Messenger' },
                ]}
              />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {viewMode === 'table' ? (
            <DataTable
              columns={columns}
              data={paginatedUsers}
              onRowClick={() => navigate('/conversations')}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className={`group bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col ${selectedIds.has(user.id) ? 'ring-2 ring-accent-500' : ''}`}>
                    <div className="flex items-center gap-2 mb-4">
                      {user.botState === 'handoff' ? (
                        <div className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1">
                          <UserCheck className="w-2.5 h-2.5" /> Agente Humano
                        </div>
                      ) : (
                        <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                          <Cpu className="w-2.5 h-2.5" /> Bot Activo
                        </div>
                      )}
                      {user.totalMessages > 0 && (
                        <div className="ml-auto bg-slate-100 dark:bg-dark-card text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {user.totalMessages} Msg
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-500 font-black text-sm">
                          {user.phoneNumber.slice(-2)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{user.phoneNumber}</h3>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{user.serviceNumber || 'Sin línea'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => toggleSelect(user.id, e)}
                          className={`p-1.5 rounded-lg transition-all ${selectedIds.has(user.id) ? 'text-accent-500 bg-accent-500/10' : 'text-slate-400 hover:text-accent-500'}`}
                        >
                          {selectedIds.has(user.id) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: user.id }); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conexión</span>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Zap className="w-3.5 h-3.5 text-accent-500" />
                          <span className="font-medium text-sm">{user.attendedBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última vez</span>
                        <span className="text-xs text-slate-500">{formatDate(user.lastInteraction)}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/conversations`)}
                        className="w-full mt-3 py-2 bg-accent-500/10 text-accent-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-500 hover:text-black transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ver Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between dark:bg-transparent mt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedUsers.length)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black">{currentPage}</span>
                      <span className="text-[10px] font-black opacity-30 uppercase">/ {totalPages || 1}</span>
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </TableCard>
      </PageBody>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message="¿Eliminar cliente y sus conversaciones? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Eliminar Clientes"
        message={`¿Eliminar los ${selectedIds.size} clientes seleccionados y sus chats?`}
        confirmText={`Eliminar (${selectedIds.size})`}
        variant="danger"
      />

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Cliente"
        icon={<UserPlus className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const email = (form.elements.namedItem('email') as HTMLInputElement).value; const phone = (form.elements.namedItem('phone') as HTMLInputElement).value; addNotification({ type: 'success', title: 'Cliente creado', message: `Se ha creado el cliente ${name}` }); setShowCreateModal(false); }} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre del cliente" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="email" name="email" placeholder="Correo electrónico" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="tel" name="phone" placeholder="Teléfono" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md">Crear Cliente</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
