import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, User } from 'lucide-react';
import { getUsers } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

type SortField = 'phoneNumber' | 'firstInteraction' | 'lastInteraction' | 'totalMessages';
type SortOrder = 'asc' | 'desc';

export const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('lastInteraction');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    getUsers()
      .then(data => {
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
      })
      .catch(err => {
        console.error('Failed to fetch users', err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredUsers = (users || []).filter(user =>
    user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <PageLoader sectionName="Usuarios" />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Directorio de"
        highlight="Usuarios"
        description="Gestiona y analiza a todos los usuarios que han interactuado con tu ecosistema de chatbots."
        icon={User}
        action={
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="px-4 py-2">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Registrados</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        }
      />

      <PageBody scrollable={true}>
        <div className="space-y-2">
          {/* Search & Bulk Area */}
          <div className="bg-white/40 dark:bg-slate-800/20 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/30 backdrop-blur-sm">
            <div className="relative group max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por número de teléfono..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-5 py-4 bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/50 transition-all text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Users Table Container */}
          <div className="bg-white/40 dark:bg-slate-800/20 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/30 overflow-hidden flex-1 min-h-0 backdrop-blur-sm">
            <div className="overflow-y-auto custom-scrollbar h-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-transparent border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-10">
                    <th
                      className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group"
                      onClick={() => handleSort('phoneNumber')}
                    >
                      <div className="flex items-center gap-2 group-hover:text-primary-500 transition-colors">
                        Identificador / Teléfono
                        <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group"
                      onClick={() => handleSort('firstInteraction')}
                    >
                      <div className="flex items-center gap-2 group-hover:text-primary-500 transition-colors">
                        Primera Interacción
                        <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group"
                      onClick={() => handleSort('lastInteraction')}
                    >
                      <div className="flex items-center gap-2 group-hover:text-primary-500 transition-colors">
                        Último Contacto
                        <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group text-right"
                      onClick={() => handleSort('totalMessages')}
                    >
                      <div className="flex items-center justify-end gap-2 group-hover:text-primary-500 transition-colors">
                        Actividad
                        <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-400 text-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            {user.phoneNumber.slice(-2)}
                          </div>
                          <div className="font-black text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                            {user.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          {formatDate(user.firstInteraction)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {formatDate(user.lastInteraction)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="text-lg font-black text-slate-900 dark:text-white">{user.totalMessages}</span>
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mensajes</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <User className="w-6 h-6" />
                          </div>
                          <p className="text-slate-500 font-bold text-sm">No se encontraron usuarios con esos criterios.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-transparent">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Mostrando <span className="text-slate-900 dark:text-white px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm">{startIndex + 1}</span> al <span className="text-slate-900 dark:text-white px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm">{Math.min(startIndex + itemsPerPage, sortedUsers.length)}</span> de <span className="text-primary-600 dark:text-primary-400">{sortedUsers.length}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Página</span>
                  <span className="text-base font-black text-primary-600 items-center justify-center flex w-8 h-8 bg-primary-50 dark:bg-primary-500/10 rounded-xl">{currentPage}</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">de {totalPages || 1}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </PageContainer>
  );
};
