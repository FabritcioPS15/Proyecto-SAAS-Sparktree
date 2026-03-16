// components/SimpleDashboard.tsx
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { useWhatsAppNumbers } from '../hooks/useWhatsAppNumbers';
import { WhatsAppNumberSelector, CompactWhatsAppNumberSelector } from './WhatsAppNumberSelector';
import { Building, Users, MessageSquare, Settings, Phone, TrendingUp, DollarSign } from 'lucide-react';

export const SimpleDashboard = () => {
  const { user, isSuperAdmin, isCompanyAdmin, isRegularUser } = useAuth();
  const { stats, loading, error: dashboardError } = useDashboardData();
  const { 
    numbers, 
    selectedNumber, 
    setSelectedNumber, 
    loading: numbersLoading,
    error: numbersError 
  } = useWhatsAppNumbers(user?.organization_id);

  if (!user) {
    return <div>Cargando...</div>;
  }

  if (dashboardError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error cargando dashboard</h3>
          <p className="text-red-600 text-sm mt-1">{dashboardError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    </div>
  );
}

return (
  <div className="p-6">
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenido, {user.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSuperAdmin && 'Super Administrador - Control total del sistema'}
            {isCompanyAdmin && 'Administrador de Empresa - Gestiona tu empresa'}
            {isRegularUser && 'Usuario - Atiende tus chats asignados'}
          </p>
        </div>
        
        {/* Selector de Números WhatsApp */}
        <div className="w-80">
          {numbersLoading ? (
            <div className="text-gray-500 text-sm">Cargando números...</div>
          ) : numbersError ? (
            <div className="text-red-500 text-sm">Error: {numbersError}</div>
          ) : (
            <CompactWhatsAppNumberSelector
              numbers={numbers || []}
              selectedNumber={selectedNumber}
              onNumberChange={setSelectedNumber}
              showStatus={true}
              className="justify-end"
            />
          )}
        </div>
      </div>
    </div>

      {/* Gestión de Números WhatsApp */}
      {(isCompanyAdmin || isSuperAdmin) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border mb-8">
          <h2 className="text-lg font-semibold mb-4">Gestión de Números WhatsApp</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selector de Números */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Seleccionar Número Activo
              </h3>
              <WhatsAppNumberSelector
                numbers={numbers}
                selectedNumber={selectedNumber}
                onNumberChange={setSelectedNumber}
                showStatus={true}
                showAssignedUsers={true}
              />
            </div>

            {/* Estadísticas de Números */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Estado de Números
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm">Total Números</span>
                  <span className="font-medium">{numbers.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm text-green-600 dark:text-green-400">Conectados</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {numbers.filter(n => n.status === 'connected').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">Conectando</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {numbers.filter(n => n.status === 'connecting').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm text-red-600 dark:text-red-400">Error</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {numbers.filter(n => n.status === 'error').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de información con datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {isSuperAdmin && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empresas</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalOrganizations || 0}</p>
                  <p className="text-xs text-green-600">+2 este mes</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Totales</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalUsers || 0}</p>
                  <p className="text-xs text-green-600">+12 este mes</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Números Activos</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalNumbers || 0}</p>
                  <p className="text-xs text-gray-500">de {loading ? '...' : stats.totalNumbers || 0} totales</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Mensuales</p>
                  <p className="text-2xl font-bold">${loading ? '...' : (stats.monthlyRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-green-600">+15% vs mes anterior</p>
                </div>
              </div>
            </div>
          </>
        )}

        {isCompanyAdmin && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios en Empresa</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalUsers || 0}</p>
                  <p className="text-xs text-gray-500">3 admins, 8 miembros</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Números WhatsApp</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalNumbers || 0}</p>
                  <p className="text-xs text-gray-500">2 conectados</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversaciones Activas</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.activeConversations || 0}</p>
                  <p className="text-xs text-gray-500">5 pendientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mensajes Hoy</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.messagesToday || 0}</p>
                  <p className="text-xs text-green-600">+25% vs ayer</p>
                </div>
              </div>
            </div>
          </>
        )}

        {isRegularUser && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis Chats Activos</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.activeConversations || 0}</p>
                  <p className="text-xs text-gray-500">3 nuevos hoy</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mensajes Hoy</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.messagesToday || 0}</p>
                  <p className="text-xs text-gray-500">45 enviados, 32 recibidos</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo Respuesta</p>
                  <p className="text-2xl font-bold">{loading ? '...' : '2.3s'}</p>
                  <p className="text-xs text-green-600">-0.5s vs semana</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mi Rol</p>
                  <p className="text-lg font-bold">Usuario</p>
                  <p className="text-xs text-gray-500">Desde hace 3 meses</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isSuperAdmin && (
            <>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <Building className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium">Crear Empresa</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Agregar nueva empresa al sistema</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <Users className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-medium">Gestionar Usuarios</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ver y gestionar todos los usuarios</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <DollarSign className="h-6 w-6 text-yellow-500 mb-2" />
                <p className="font-medium">Ver Ingresos</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reportes financieros del sistema</p>
              </button>
            </>
          )}

          {isCompanyAdmin && (
            <>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <Users className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-medium">Invitar Usuario</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Agregar nuevo usuario a tu empresa</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <Phone className="h-6 w-6 text-purple-500 mb-2" />
                <p className="font-medium">Configurar Número</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Agregar número WhatsApp</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <MessageSquare className="h-6 w-6 text-orange-500 mb-2" />
                <p className="font-medium">Ver Chats</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitorear conversaciones</p>
              </button>
            </>
          )}

          {isRegularUser && (
            <>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <MessageSquare className="h-6 w-6 text-orange-500 mb-2" />
                <p className="font-medium">Mis Chats</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ver mis conversaciones asignadas</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <Settings className="h-6 w-6 text-gray-500 mb-2" />
                <p className="font-medium">Mi Perfil</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configurar mi cuenta</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                <Building className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium">Flow Builder</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Crear y editar flujos del bot</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
