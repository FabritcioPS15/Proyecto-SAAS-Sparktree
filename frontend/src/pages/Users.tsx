import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, User } from 'lucide-react';
import { getUsers } from '../services/api';

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
        // Ensure we always have an array
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
      })
      .catch(err => {
        console.error('Failed to fetch users', err);
        setUsers([]); // Set empty array on error
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

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-xl duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Directorio de <span className="text-indigo-600 dark:text-indigo-400">Usuarios</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
              Gestiona y analiza a todos los usuarios que han interactuado con tu ecosistema de chatbots.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="px-6 py-3">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Registrados</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-24 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Cargando Usuarios...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search & Bulk Area */}
            <div className="bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[2rem] p-6 border border-gray-200 dark:border-gray-800/50 shadow-sm">
              <div className="relative group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por número de teléfono..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Users Table Container */}
            <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-transparent border-b border-gray-100 dark:border-gray-800/50">
                      <th
                        className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group"
                        onClick={() => handleSort('phoneNumber')}
                      >
                        <div className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                          Identificador / Teléfono
                          <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                        </div>
                      </th>
                      <th
                        className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group"
                        onClick={() => handleSort('firstInteraction')}
                      >
                        <div className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                          Primera Interacción
                          <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                        </div>
                      </th>
                      <th
                        className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group"
                        onClick={() => handleSort('lastInteraction')}
                      >
                        <div className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                          Último Contacto
                          <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                        </div>
                      </th>
                      <th
                        className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer group text-right"
                        onClick={() => handleSort('totalMessages')}
                      >
                        <div className="flex items-center justify-end gap-2 group-hover:text-indigo-500 transition-colors">
                          Actividad
                          <ArrowUpDown className="w-3 h-3 transition-opacity opacity-20 group-hover:opacity-100" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-400 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                              {user.phoneNumber.slice(-2)}
                            </div>
                            <div className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {user.phoneNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            {formatDate(user.firstInteraction)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {formatDate(user.lastInteraction)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="inline-flex flex-col items-end">
                            <span className="text-xl font-black text-slate-900 dark:text-white">{user.totalMessages}</span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mensajes</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-24 text-center">
                          <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                              <User className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 font-bold">No se encontraron usuarios con esos criterios.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-8 border-t border-gray-100 dark:border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/30 dark:bg-transparent">
                <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Mostrando <span className="text-slate-900 dark:text-white px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{startIndex + 1}</span> al <span className="text-slate-900 dark:text-white px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{Math.min(startIndex + itemsPerPage, sortedUsers.length)}</span> de <span className="text-indigo-600 dark:text-indigo-400">{sortedUsers.length}</span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Página</span>
                    <span className="text-lg font-black text-indigo-600 items-center justify-center flex w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">{currentPage}</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">de {totalPages || 1}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
