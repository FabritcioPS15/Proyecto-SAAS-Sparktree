import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
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
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users', err))
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

  const filteredUsers = users.filter(user =>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Usuarios</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Gestiona y analiza a los usuarios que interactúan con tu chatbot</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-gray-900 dark:text-white shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-800/50">
              <tr>
                <th
                  className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('phoneNumber')}
                >
                  <div className="flex items-center gap-2">
                    Teléfono
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('firstInteraction')}
                >
                  <div className="flex items-center gap-2">
                    1ra Interacción
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('lastInteraction')}
                >
                  <div className="flex items-center gap-2">
                    Última Interacción
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right"
                  onClick={() => handleSort('totalMessages')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Mensajes
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {user.phoneNumber.slice(-2)}
                      </div>
                      {user.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(user.firstInteraction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(user.lastInteraction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300 text-right">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold">{user.totalMessages}</span>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Mostrando <span className="text-gray-900 dark:text-white">{startIndex + 1}</span> al <span className="text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, sortedUsers.length)}</span> de <span className="text-gray-900 dark:text-white">{sortedUsers.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-2">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
