import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, User, Trash2, Phone, UserCheck, CheckSquare, Square, MessageSquare, List, LayoutGrid, Cpu, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, deleteUsersBulk } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

type SortField = 'phoneNumber' | 'firstInteraction' | 'lastInteraction' | 'totalMessages' | 'attendedBy' | 'usageTime';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';



export const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('lastInteraction');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('¿Eliminar cliente y sus conversaciones?')) {
      try {
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('No se pudo eliminar el cliente. Vuelve a intentarlo.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`¿Eliminar los ${selectedIds.size} clientes seleccionados y sus chats?`)) {
      try {
        await deleteUsersBulk(Array.from(selectedIds));
        setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
        setSelectedIds(new Set());
      } catch (err) {
        console.error('Error deleting users bulk:', err);
        alert('Error al eliminar masivamente. Algunos clientes podrían no haberse borrado.');
      }
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

  const filteredUsers = (users || []).filter(user =>
    user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.attendedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <PageContainer>
      <PageHeader
        title="Directorio de"
        highlight="Clientes"
        description="Gestión integral de interacciones."
        icon={User}
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
                onClick={() => setViewMode('grid')}
                className={`p-2.5 h-full rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-black shadow-sm text-accent-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista de Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 h-10 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar ({selectedIds.size})
              </button>
            )}
            <div className="bg-slate-50 dark:bg-white/5 px-4 h-10 flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total: {users.length}</p>
            </div>
          </div>
        }
      />

      <PageBody>
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
            <input
              type="text" placeholder="Buscar por número o agente..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-5 py-3 bg-white dark:bg-[#11141b] border border-slate-100 dark:border-slate-800 rounded-xl focus:border-accent-500/50 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-[#11141b] rounded-xl border border-slate-100 dark:border-slate-800/50 overflow-hidden shadow-sm">
              <div className="overflow-x-auto text-[13px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-slate-800">
                      <th className="w-12 px-5 py-3">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-accent-500 transition-colors">
                          {selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </th>
                      <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-pointer" onClick={() => handleSort('phoneNumber')}>
                        <div className="flex items-center gap-2">Cliente <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-pointer" onClick={() => handleSort('attendedBy')}>
                        <div className="flex items-center gap-2">Atendido por <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px]">Línea</th>
                      <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] cursor-pointer" onClick={() => handleSort('lastInteraction')}>
                        <div className="flex items-center gap-2">Última Vez <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="px-5 py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => navigate('/conversations')}
                        className={`hover:bg-slate-50 dark:hover:bg-white/2 transition-all cursor-pointer group/row ${selectedIds.has(user.id) ? 'bg-accent-500/5' : ''}`}
                      >
                        <td className="px-5 py-3">
                          <button onClick={(e) => toggleSelect(user.id, e)} className={`${selectedIds.has(user.id) ? 'text-accent-500' : 'text-slate-300 dark:text-slate-600'} hover:text-accent-500 transition-colors`}>
                            {selectedIds.has(user.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent-500/10 text-accent-500 flex items-center justify-center font-black text-[10px]">
                              {user.phoneNumber.slice(-2)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block leading-none">{user.phoneNumber}</span>
                              <span className="text-[10px] text-accent-500 opacity-0 group-hover/row:opacity-100 transition-all flex items-center gap-1 mt-1">
                                <MessageSquare className="w-2.5 h-2.5" /> Ir al chat
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            {user.botState === 'handoff' ? (
                              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span className="font-medium">{user.attendedBy}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 text-slate-500 uppercase text-[10px] font-bold">
                            <Phone className="w-3.5 h-3.5 opacity-50" />
                            <span>{user.serviceNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {formatDate(user.lastInteraction)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={(e) => handleDelete(user.id, e)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-transparent">
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedUsers.map((user) => (
                <div key={user.id} className={`group bg-white dark:bg-[#11141b] p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col ${selectedIds.has(user.id) ? 'ring-2 ring-accent-500' : ''}`}>
                  
                  {/* Status Badge */}
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
                      <div className="ml-auto bg-slate-100 dark:bg-white/5 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
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
                        onClick={(e) => handleDelete(user.id, e)}
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
          )}

          {viewMode === 'grid' && (
            <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-transparent">
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
        </div>
      </PageBody>
    </PageContainer>
  );
};
