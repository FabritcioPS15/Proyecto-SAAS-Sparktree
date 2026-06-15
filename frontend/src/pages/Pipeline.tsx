import { useState, useEffect } from 'react';
import { Kanban, Plus, DollarSign, Edit, Trash2, Building2 } from 'lucide-react';
import { getCrmPipeline, createCrmDeal, updateCrmDeal, deleteCrmDeal, getCrmClients } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';

export const Pipeline = () => {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    value: 0,
    stage: 'prospecting',
    probability: 10,
    expected_close_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pipelineData, clientsData] = await Promise.all([
        getCrmPipeline(),
        getCrmClients()
      ]);
      setPipeline(pipelineData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await updateCrmDeal(editingDeal.id, formData);
      } else {
        await createCrmDeal(formData);
      }
      setShowModal(false);
      setEditingDeal(null);
      setFormData({ client_id: '', name: '', value: 0, stage: 'prospecting', probability: 10, expected_close_date: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  };

  const handleEdit = (deal: any) => {
    setEditingDeal(deal);
    setFormData({
      client_id: deal.client_id,
      name: deal.name,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expected_close_date: deal.expected_close_date || '',
      notes: deal.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este deal?')) {
      try {
        await deleteCrmDeal(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting deal:', error);
      }
    }
  };

  const handleMoveDeal = async (dealId: string, newStage: string) => {
    try {
      await updateCrmDeal(dealId, { stage: newStage });
      fetchData();
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageBody scrollable={true}>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Cargando pipeline...</div>
          </div>
        </PageBody>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Pipeline"
        highlight="Kanban de Ventas"
        description="Gestiona tus deals y pipeline de ventas en tiempo real."
        icon={Kanban}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Deal
          </button>
        }
      />

      <PageBody scrollable={true}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipeline.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="font-bold text-gray-900 dark:text-white">{stage.name}</h3>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                  {stage.deals.length}
                </span>
              </div>

              <div className="space-y-3">
                {stage.deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                    draggable
                    onDragEnd={() => {
                      // Handle drag and drop
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{deal.name}</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(deal)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit className="w-3 h-3 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {deal.crm_clients && (
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {deal.crm_clients.company || deal.crm_clients.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ${deal.value?.toLocaleString() || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{deal.probability}%</span>
                    </div>

                    {deal.expected_close_date && (
                      <div className="text-xs text-gray-500">
                        Cierre: {new Date(deal.expected_close_date).toLocaleDateString('es-ES')}
                      </div>
                    )}

                    {/* Stage selector */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleMoveDeal(deal.id, e.target.value)}
                        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="prospecting">Prospectación</option>
                        <option value="qualification">Calificación</option>
                        <option value="proposal">Propuesta</option>
                        <option value="negotiation">Negociación</option>
                        <option value="closed_won">Ganado</option>
                        <option value="closed_lost">Perdido</option>
                      </select>
                    </div>
                  </div>
                ))}

                {stage.deals.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No hay deals en esta etapa
                  </div>
                )}
              </div>

              {/* Stage total */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total etapa:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${stage.deals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingDeal ? 'Editar Deal' : 'Nuevo Deal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
                  <select
                    required
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Deal *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor ($)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etapa</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="prospecting">Prospectación</option>
                    <option value="qualification">Calificación</option>
                    <option value="proposal">Propuesta</option>
                    <option value="negotiation">Negociación</option>
                    <option value="closed_won">Ganado</option>
                    <option value="closed_lost">Perdido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Probabilidad (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha esperada de cierre</label>
                  <input
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDeal(null);
                      setFormData({ client_id: '', name: '', value: 0, stage: 'prospecting', probability: 10, expected_close_date: '', notes: '' });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {editingDeal ? 'Actualizar' : 'Crear'}
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
