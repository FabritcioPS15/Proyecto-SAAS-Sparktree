import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Plus, Search, Filter, Edit, Trash2, Phone, Mail, Building2 } from 'lucide-react';
import { getCrmClients, createCrmClient, updateCrmClient, deleteCrmClient, getCrmDashboard } from '../../../services/api';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';

export const CRM = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
    source: 'manual',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsData, dashboardData] = await Promise.all([
        getCrmClients(),
        getCrmDashboard()
      ]);
      setClients(clientsData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error fetching CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateCrmClient(editingClient.id, formData);
      } else {
        await createCrmClient(formData);
      }
      setShowModal(false);
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', company: '', status: 'lead', source: 'manual', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      status: client.status,
      source: client.source || 'manual',
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteCrmClient(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <PageContainer>
        <PageBody scrollable={true}>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Cargando...</div>
          </div>
        </PageBody>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="CRM"
        highlight="Gestión de Clientes"
        description="Administra tus clientes, deals y pipeline de ventas."
        icon={Users}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        }
      />

      <PageBody scrollable={true}>
        {/* Dashboard Metrics */}
        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase">Total</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{dashboard.totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">Clientes</p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase">Valor</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">${dashboard.totalValue?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Pipeline Total</p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase">Conversión</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{dashboard.conversionRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">Tasa de conversión</p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase">Activos</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{dashboard.clientsByStatus?.customer || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Clientes activos</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fuente</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-bold text-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="w-4 h-4 mr-2" />
                      {client.company || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      client.status === 'customer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      client.status === 'prospect' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      client.status === 'lead' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                      {client.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {client.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{client.source}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingClient(null);
                      setFormData({ name: '', email: '', phone: '', company: '', status: 'lead', source: 'manual', notes: '' });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {editingClient ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageBody>
    </PageContainer>
  );
};
