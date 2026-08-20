import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth headers
api.interceptors.request.use((config) => {
  const savedSession = localStorage.getItem('sparkbot_session');
  if (savedSession) {
    try {
      const { user, organizationId } = JSON.parse(savedSession);
      if (organizationId) {
        config.headers['X-Organization-ID'] = organizationId;
      }
      if (user?.id) {
        config.headers['X-User-ID'] = user.id;
      }
    } catch (e) {
      console.error('Interceptor: Failed to parse session', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    const response = await api.get('/crm/clients');
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getContacts = async () => {
  try {
    // Usar el endpoint de conversaciones que ya funciona y devuelve contactos
    const response = await api.get('/conversations');
    console.log('Conversations response:', response.data);
    
    // Extraer los contactos únicos de las conversaciones
    const conversations = Array.isArray(response.data) ? response.data : [];
    console.log('Conversations array:', conversations);
    console.log('Conversations length:', conversations.length);
    
    // Obtener el número de WhatsApp de la conexión activa
    let whatsappLineNumber = '';
    try {
      const connectionsResponse = await api.get('/whatsapp-connections');
      const connections = Array.isArray(connectionsResponse.data) ? connectionsResponse.data : [];
      const activeConnection = connections.find((c: any) => c.status === 'connected');
      if (activeConnection && activeConnection.phone_number) {
        whatsappLineNumber = activeConnection.phone_number;
        console.log('WhatsApp line number:', whatsappLineNumber);
      }
    } catch (e) {
      console.log('Could not fetch WhatsApp connections:', e);
    }
    
    const contactsMap = new Map();
    
    conversations.forEach((conv: any) => {
      console.log('Processing conversation:', conv);
      if (conv.contactId && conv.contactId.phoneNumber) {
        const key = conv.contactId.phoneNumber;
        console.log('Contact found:', conv.contactId);
        
        // Usar el phoneNumber directamente (el backend está enviando IDs internos)
        let realPhoneNumber = conv.contactId.phoneNumber;
        
        if (!contactsMap.has(key)) {
          contactsMap.set(key, {
            id: conv.contactId.id || conv.contactId._id,
            phone_number: realPhoneNumber,
            profile_name: conv.contactId.name,
            profile_picture: conv.contactId.profilePicture,
            platform_type: 'whatsapp', // Asumir whatsapp por ahora
            last_active_at: conv.lastMessageAt,
            whatsapp_line_number: whatsappLineNumber, // Número de la conexión activa
            custom_attributes: {
              whatsapp_jid: conv.contactId.phoneNumber,
              real_phone_number: realPhoneNumber !== conv.contactId.phoneNumber ? realPhoneNumber : undefined
            }
          });
        }
      }
    });
    
    const contacts = Array.from(contactsMap.values());
    console.log('Final contacts:', contacts);
    console.log('Contacts length:', contacts.length);
    
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const deleteUsersBulk = async (ids: string[]) => {
  try {
    const response = await api.post('/users/delete-bulk', { ids });
    return response.data;
  } catch (error) {
    console.error('Error deleting users bulk:', error);
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (id: string) => {
  try {
    const response = await api.get(`/conversations/${id}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const deleteConversation = async (id: string) => {
  try {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const getAnalytics = async () => {
  try {
    const response = await api.get('/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const saveSettings = async (settingsData: any) => {
  try {
    const response = await api.post('/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getFlows = async () => {
  try {
    const response = await api.get('/flows');
    return response.data;
  } catch (error) {
    console.error('Error fetching flows:', error);
    throw error;
  }
};

export const saveFlows = async (flowData: any, id?: string) => {
  try {
    if (id) {
      const response = await api.put(`/flows/${id}`, flowData);
      return response.data;
    } else {
      const response = await api.post('/flows', flowData);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving flow:', error);
    throw error;
  }
};

export const getActiveConnectionsForFlow = async (flowId: string) => {
  try {
    const response = await api.get(`/flows/${flowId}/active-connections`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active connections for flow:', error);
    throw error;
  }
};

export const getOrganizations = async () => {
  try {
    const response = await api.get('/admin/organizations');
    return response.data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

export const createOrganization = async (orgData: any) => {
  try {
    const response = await api.post('/admin/organizations', orgData);
    return response.data;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

export const updateOrganization = async (id: string, orgData: any) => {
  try {
    const response = await api.put(`/admin/organizations/${id}`, orgData);
    return response.data;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

export const deleteOrganization = async (id: string) => {
  try {
    const response = await api.delete(`/admin/organizations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
};

export const updateOrganizationPayment = async (id: string, paymentStatus: string) => {
  try {
    const response = await api.put(`/admin/organizations/${id}/payment`, { paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

export const updateOrganizationNotification = async (id: string, notification: string | null, showPopup: boolean) => {
  try {
    const response = await api.put(`/admin/organizations/${id}/notification`, { notification, showPopup });
    return response.data;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

export const getOrganizationNotifications = async () => {
  try {
    const response = await api.get('/admin/organizations/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getLeads = async () => {
  try {
    const response = await api.get('/leads');
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error; // Let the component handle the fallback
  }
};

export const getQRStatus = async () => {
  try {
    const response = await api.get('/qr/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching QR status:', error);
    throw error;
  }
};

export const initializeQR = async () => {
  try {
    const response = await api.post('/qr/init');
    return response.data;
  } catch (error) {
    console.error('Error initializing QR:', error);
    throw error;
  }
};

export const logoutQR = async () => {
  try {
    const response = await api.post('/qr/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out QR:', error);
    throw error;
  }
};

export const getPlatformConnections = async () => {
  try {
    const response = await api.get('/platform/connections');
    return response.data;
  } catch (error) {
    console.error('Error fetching platform connections:', error);
    return [];
  }
};

export const createPlatformConnection = async (data: { platformType: string; displayName: string; config: any }) => {
  try {
    const response = await api.post('/platform/connections', data);
    return response.data;
  } catch (error) {
    console.error('Error creating platform connection:', error);
    throw error;
  }
};

export const startPlatformConnection = async (id: string) => {
  try {
    const response = await api.post(`/platform/connections/${id}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting platform connection:', error);
    throw error;
  }
};

export const deletePlatformConnection = async (id: string) => {
  try {
    const response = await api.post(`/platform/connections/${id}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting platform connection:', error);
    throw error;
  }
};

export const createWhatsAppCloudConnection = async (data: {
  phoneNumberId: string;
  accessToken: string;
  displayName: string;
  webhookVerifyToken?: string;
}) => {
  try {
    const response = await api.post('/platform/whatsapp-cloud', data);
    return response.data;
  } catch (error) {
    console.error('Error creating WhatsApp Cloud connection:', error);
    throw error;
  }
};

// Automation / Workflows endpoints
export const getWorkflows = async () => {
  try {
    const response = await api.get('/automation/workflows');
    return response.data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
};

export const getWorkflow = async (id: string) => {
  try {
    const response = await api.get(`/automation/workflows/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow:', error);
    throw error;
  }
};

export const createWorkflow = async (workflowData: any) => {
  try {
    const response = await api.post('/automation/workflows', workflowData);
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

export const updateWorkflow = async (id: string, workflowData: any) => {
  try {
    const response = await api.put(`/automation/workflows/${id}`, workflowData);
    return response.data;
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
};

export const deleteWorkflow = async (id: string) => {
  try {
    const response = await api.delete(`/automation/workflows/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

export const activateWorkflow = async (id: string) => {
  try {
    const response = await api.post(`/automation/workflows/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating workflow:', error);
    throw error;
  }
};

export const deactivateWorkflow = async (id: string) => {
  try {
    const response = await api.post(`/automation/workflows/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating workflow:', error);
    throw error;
  }
};

export const executeWorkflow = async (id: string, triggerEvent: any) => {
  try {
    const response = await api.post(`/automation/workflows/${id}/execute`, { triggerEvent });
    return response.data;
  } catch (error) {
    console.error('Error executing workflow:', error);
    throw error;
  }
};

export const getWorkflowExecutions = async (id: string) => {
  try {
    const response = await api.get(`/automation/workflows/${id}/executions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    throw error;
  }
};

export const getExecution = async (id: string) => {
  try {
    const response = await api.get(`/automation/executions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching execution:', error);
    throw error;
  }
};

export const stopExecution = async (id: string) => {
  try {
    const response = await api.post(`/automation/executions/${id}/stop`);
    return response.data;
  } catch (error) {
    console.error('Error stopping execution:', error);
    throw error;
  }
};

export const getNodeTypes = async () => {
  try {
    const response = await api.get('/automation/nodes');
    return response.data;
  } catch (error) {
    console.error('Error fetching node types:', error);
    throw error;
  }
};

export const getNodeSchema = async (type: string) => {
  try {
    const response = await api.get(`/automation/nodes/${type}/schema`);
    return response.data;
  } catch (error) {
    console.error('Error fetching node schema:', error);
    throw error;
  }
};

export const validateWorkflow = async (workflow: any) => {
  try {
    const response = await api.post('/automation/validate', workflow);
    return response.data;
  } catch (error) {
    console.error('Error validating workflow:', error);
    throw error;
  }
};

export const triggerWorkflows = async (event: any) => {
  try {
    const response = await api.post('/automation/trigger', event);
    return response.data;
  } catch (error) {
    console.error('Error triggering workflows:', error);
    throw error;
  }
};

// Billing endpoints
export const getPlans = async () => {
  try {
    const response = await api.get('/billing/plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

export const getPlan = async (id: string) => {
  try {
    const response = await api.get(`/billing/plans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching plan:', error);
    throw error;
  }
};

export const createSubscription = async (data: { tenantId: string; planId: string; cycle: string; trialDays?: number }) => {
  try {
    const response = await api.post('/billing/subscriptions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const getSubscription = async (tenantId: string) => {
  try {
    const response = await api.get(`/billing/subscriptions/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (id: string, updates: any) => {
  try {
    const response = await api.put(`/billing/subscriptions/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (id: string, cancelAtPeriodEnd: boolean = true) => {
  try {
    const response = await api.post(`/billing/subscriptions/${id}/cancel`, { cancelAtPeriodEnd });
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

export const getInvoices = async (tenantId: string) => {
  try {
    const response = await api.get(`/billing/invoices/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const createInvoice = async (data: { tenantId: string; subscriptionId: string; items: any[] }) => {
  try {
    const response = await api.post('/billing/invoices', data);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const payInvoice = async (id: string, paymentMethodId: string) => {
  try {
    const response = await api.post(`/billing/invoices/${id}/pay`, { paymentMethodId });
    return response.data;
  } catch (error) {
    console.error('Error paying invoice:', error);
    throw error;
  }
};

export const getPaymentMethods = async (tenantId: string) => {
  try {
    const response = await api.get(`/billing/payment-methods/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

export const addPaymentMethod = async (data: any) => {
  try {
    const response = await api.post('/billing/payment-methods', data);
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

export const setDefaultPaymentMethod = async (id: string, tenantId: string) => {
  try {
    const response = await api.put(`/billing/payment-methods/${id}/default`, { tenantId });
    return response.data;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

export const recordUsage = async (data: { tenantId: string; subscriptionId: string; metrics: any }) => {
  try {
    const response = await api.post('/billing/usage', data);
    return response.data;
  } catch (error) {
    console.error('Error recording usage:', error);
    throw error;
  }
};

export const getUsage = async (tenantId: string, startDate?: Date, endDate?: Date) => {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    const response = await api.get(`/billing/usage/${tenantId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching usage:', error);
    throw error;
  }
};

export const checkLimits = async (tenantId: string) => {
  try {
    const response = await api.get(`/billing/limits/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking limits:', error);
    throw error;
  }
};

// Auth endpoints
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (data: { email: string; password: string; name: string; organizationName?: string }) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const recoverPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/recover-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error recovering password:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// CRM endpoints
export const getCrmClients = async () => {
  try {
    const response = await api.get('/crm/clients');
    return response.data;
  } catch (error) {
    console.error('Error fetching CRM clients:', error);
    throw error;
  }
};

export const createCrmClient = async (data: any) => {
  try {
    const response = await api.post('/crm/clients', data);
    return response.data;
  } catch (error) {
    console.error('Error creating CRM client:', error);
    throw error;
  }
};

export const updateCrmClient = async (id: string, data: any) => {
  try {
    const response = await api.put(`/crm/clients/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating CRM client:', error);
    throw error;
  }
};

export const deleteCrmClient = async (id: string) => {
  try {
    const response = await api.delete(`/crm/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting CRM client:', error);
    throw error;
  }
};

export const getCrmDeals = async () => {
  try {
    const response = await api.get('/crm/deals');
    return response.data;
  } catch (error) {
    console.error('Error fetching CRM deals:', error);
    throw error;
  }
};

export const createCrmDeal = async (data: any) => {
  try {
    const response = await api.post('/crm/deals', data);
    return response.data;
  } catch (error) {
    console.error('Error creating CRM deal:', error);
    throw error;
  }
};

export const updateCrmDeal = async (id: string, data: any) => {
  try {
    const response = await api.put(`/crm/deals/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating CRM deal:', error);
    throw error;
  }
};

export const deleteCrmDeal = async (id: string) => {
  try {
    const response = await api.delete(`/crm/deals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting CRM deal:', error);
    throw error;
  }
};

export const getCrmPipeline = async () => {
  try {
    const response = await api.get('/crm/pipeline');
    return response.data;
  } catch (error) {
    console.error('Error fetching CRM pipeline:', error);
    throw error;
  }
};

export const getCrmDashboard = async () => {
  try {
    const response = await api.get('/crm/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching CRM dashboard:', error);
    throw error;
  }
};

// Catalogs endpoints
const MOCK_CATALOGS = [
  {
    id: 'mock-cat-1',
    name: 'Productos Destacados',
    description: 'Catálogo de productos más vendidos',
    status: 'active',
    items: [
      { id: 'mock-item-1', title: 'Camiseta Premium', price: '29.99', type: 'image', url: '', description: 'Camiseta de algodón orgánico', media_url: 'https://picsum.photos/seed/shirt/400/400', media_type: 'image' },
      { id: 'mock-item-2', title: 'Taza Personalizada', price: '14.99', type: 'image', url: '', description: 'Taza de cerámica con diseño exclusivo', media_url: 'https://picsum.photos/seed/mug/400/400', media_type: 'image' },
      { id: 'mock-item-3', title: 'Gorra Deportiva', price: '19.99', type: 'image', url: '', description: 'Gorra ajustable transpirable', media_url: 'https://picsum.photos/seed/cap/400/400', media_type: 'image' },
    ],
  },
  {
    id: 'mock-cat-2',
    name: 'Servicios Digitales',
    description: 'Paquetes de servicios online',
    status: 'active',
    items: [
      { id: 'mock-item-4', title: 'Plan Básico', price: '9.99', type: 'image', url: '', description: 'Acceso a contenido básico por 1 mes', media_url: 'https://picsum.photos/seed/basic/400/400', media_type: 'image' },
      { id: 'mock-item-5', title: 'Plan Premium', price: '29.99', type: 'image', url: '', description: 'Acceso ilimitado + soporte prioritario', media_url: 'https://picsum.photos/seed/premium/400/400', media_type: 'image' },
    ],
  },
  {
    id: 'mock-cat-3',
    name: 'Ofertas Especiales',
    description: 'Productos en descuento por tiempo limitado',
    status: 'draft',
    items: [
      { id: 'mock-item-6', title: 'Pack Bienvenida', price: '49.99', type: 'image', url: '', description: 'Kit completo de bienvenida con 3 productos', media_url: 'https://picsum.photos/seed/welcome/400/400', media_type: 'image' },
    ],
  },
];

export const getCatalogs = async () => {
  try {
    const response = await api.get('/catalogs');
    return response.data;
  } catch (error) {
    console.warn('API fallback: using mock catalog data');
    return MOCK_CATALOGS;
  }
};

export const createCatalog = async (data: any) => {
  try {
    const response = await api.post('/catalogs', data);
    return response.data;
  } catch (error) {
    console.error('Error creating catalog:', error);
    throw error;
  }
};

export const updateCatalog = async (id: string, data: any) => {
  try {
    const response = await api.put(`/catalogs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating catalog:', error);
    throw error;
  }
};

export const deleteCatalog = async (id: string) => {
  try {
    const response = await api.delete(`/catalogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting catalog:', error);
    throw error;
  }
};

// ============ Knowledge Base (RAG) endpoints ============
const MOCK_KNOWLEDGE_BASES = [
  {
    id: 'kb-mock-1',
    name: 'Productos y Servicios',
    description: 'Información de productos, precios y disponibilidad',
    documentCount: 3,
    chunkSize: 500,
    chunkOverlap: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-mock-2',
    name: 'FAQ y Soporte',
    description: 'Preguntas frecuentes y políticas de atención',
    documentCount: 2,
    chunkSize: 400,
    chunkOverlap: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_DOCUMENTS: Record<string, any[]> = {
  'kb-mock-1': [
    { id: 'doc-mock-1', title: 'Catálogo de productos 2024', type: 'text', status: 'ready', chunkCount: 8, createdAt: new Date().toISOString() },
    { id: 'doc-mock-2', title: 'Política de precios', type: 'text', status: 'ready', chunkCount: 4, createdAt: new Date().toISOString() },
    { id: 'doc-mock-3', title: 'https://ejemplo.com/productos', type: 'url', status: 'ready', chunkCount: 6, createdAt: new Date().toISOString() },
  ],
  'kb-mock-2': [
    { id: 'doc-mock-4', title: 'Preguntas frecuentes', type: 'text', status: 'ready', chunkCount: 12, createdAt: new Date().toISOString() },
    { id: 'doc-mock-5', title: 'Términos del servicio', type: 'text', status: 'processing', chunkCount: 0, createdAt: new Date().toISOString() },
  ],
};

export const getKnowledgeBases = async () => {
  try {
    const response = await api.get('/knowledge/bases');
    return response.data;
  } catch (error) {
    console.warn('API fallback: using mock KB data');
    return MOCK_KNOWLEDGE_BASES;
  }
};

export const createKnowledgeBase = async (data: { name: string; description?: string }) => {
  try {
    const response = await api.post('/knowledge/bases', data);
    return response.data;
  } catch (error) {
    console.warn('API fallback: mock create KB');
    return { id: `kb-mock-${Date.now()}`, ...data, documentCount: 0, chunkSize: 500, chunkOverlap: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
};

export const deleteKnowledgeBase = async (id: string) => {
  try {
    const response = await api.delete(`/knowledge/bases/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API fallback: mock delete KB');
    return { success: true };
  }
};

export const getKnowledgeDocuments = async (baseId: string) => {
  try {
    const response = await api.get(`/knowledge/bases/${baseId}/documents`);
    return response.data;
  } catch (error) {
    console.warn('API fallback: using mock documents');
    return MOCK_DOCUMENTS[baseId] || [];
  }
};

export const addDocument = async (baseId: string, data: { title: string; content?: string; url?: string; type: string }) => {
  try {
    const response = await api.post(`/knowledge/bases/${baseId}/documents`, data);
    return response.data;
  } catch (error) {
    console.warn('API fallback: mock add document');
    return { id: `doc-mock-${Date.now()}`, title: data.title, type: data.type, status: 'processing', chunkCount: 0, createdAt: new Date().toISOString() };
  }
};

export const deleteDocument = async (baseId: string, docId: string) => {
  try {
    const response = await api.delete(`/knowledge/documents/${docId}`);
    return response.data;
  } catch (error) {
    console.warn('API fallback: mock delete document');
    return { success: true };
  }
};

export const ragQuery = async (data: { knowledgeBaseId: string; query: string }) => {
  try {
    const response = await api.post('/knowledge/rag', data);
    return response.data;
  } catch (error) {
    console.warn('API fallback: mock RAG query');
    const mockSources = [
      { title: 'Fragmento sobre productos', content: 'Nuestros productos incluyen camisetas, tazas y gorras personalizadas.', similarity: 0.92 },
      { title: 'Información de precios', content: 'Los precios van desde $9.99 para planes básicos hasta $29.99 para premium.', similarity: 0.78 },
    ];
    return {
      context: 'Información relevante encontrada en la base de conocimiento:\n' + mockSources.map(s => s.content).join('\n'),
      sources: mockSources,
      query: data.query,
      knowledgeBaseId: data.knowledgeBaseId,
    };
  }
};

// ============ AI Provider endpoints ============
export const getAIProviders = async () => {
  try {
    const response = await api.get('/ai/providers');
    return response.data;
  } catch (error) {
    console.warn('API fallback: using mock AI provider config');
    const saved = localStorage.getItem('sparkbot_ai_providers');
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveAIProvider = async (data: { provider: string; apiKey: string; model: string; baseUrl?: string }) => {
  try {
    const response = await api.post('/ai/providers', data);
    return response.data;
  } catch (error) {
    console.warn('API fallback: saving AI provider to localStorage');
    const saved = localStorage.getItem('sparkbot_ai_providers');
    const providers = saved ? JSON.parse(saved) : [];
    const existing = providers.findIndex((p: any) => p.provider === data.provider);
    if (existing >= 0) providers[existing] = { ...providers[existing], ...data };
    else providers.push({ id: `provider-${Date.now()}`, ...data });
    localStorage.setItem('sparkbot_ai_providers', JSON.stringify(providers));
    return { success: true };
  }
};

export const deleteAIProvider = async (provider: string) => {
  try {
    const response = await api.delete(`/ai/providers/${provider}`);
    return response.data;
  } catch (error) {
    console.warn('API fallback: deleting AI provider from localStorage');
    const saved = localStorage.getItem('sparkbot_ai_providers');
    const providers = saved ? JSON.parse(saved) : [];
    localStorage.setItem('sparkbot_ai_providers', JSON.stringify(providers.filter((p: any) => p.provider !== provider)));
    return { success: true };
  }
};

export const uploadProductMedia = async (file: File) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          // Extract base64 content
          const content = base64Data.split(',')[1];
          const response = await api.post('/catalogs/upload', {
            fileName: file.name,
            contentType: file.type,
            base64Data: content
          });
          resolve(response.data.url);
        } catch (err) {
          console.error('Error uploading to backend:', err);
          reject(err);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

// ============ Calendar endpoints ============
export const getCalendarEvents = async () => {
  try {
    const response = await api.get('/calendar/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const createCalendarEvent = async (data: any) => {
  try {
    const response = await api.post('/calendar/events', data);
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (id: string, data: any) => {
  try {
    const response = await api.put(`/calendar/events/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

export const deleteCalendarEvent = async (id: string) => {
  try {
    const response = await api.delete(`/calendar/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

// ============ Business Hours endpoints ============
export const getBusinessHours = async () => {
  try {
    const response = await api.get('/business-hours');
    return response.data;
  } catch (error) {
    console.error('Error fetching business hours:', error);
    throw error;
  }
};

export const createBusinessHour = async (data: any) => {
  try {
    const response = await api.post('/business-hours', data);
    return response.data;
  } catch (error) {
    console.error('Error creating business hour:', error);
    throw error;
  }
};

export const updateBusinessHour = async (id: string, data: any) => {
  try {
    const response = await api.put(`/business-hours/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating business hour:', error);
    throw error;
  }
};

export const deleteBusinessHour = async (id: string) => {
  try {
    const response = await api.delete(`/business-hours/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting business hour:', error);
    throw error;
  }
};

// ============ Promotions endpoints ============
export const getPromotions = async () => {
  try {
    const response = await api.get('/promotions');
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

export const createPromotion = async (data: any) => {
  try {
    const response = await api.post('/promotions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

export const updatePromotion = async (id: string, data: any) => {
  try {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

export const deletePromotion = async (id: string) => {
  try {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

// ============ Quotes endpoints ============
export const getQuotes = async () => {
  try {
    const response = await api.get('/quotes');
    return response.data;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
};

export const createQuote = async (data: any) => {
  try {
    const response = await api.post('/quotes', data);
    return response.data;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
};

export const updateQuote = async (id: string, data: any) => {
  try {
    const response = await api.put(`/quotes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
};

export const deleteQuote = async (id: string) => {
  try {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
};

// ============ Orders endpoints ============
export const getOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const createOrder = async (data: any) => {
  try {
    const response = await api.post('/orders', data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (id: string, data: any) => {
  try {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const deleteOrder = async (id: string) => {
  try {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ============ Campaigns (mensajes masivos desde Excel) endpoints ============
export const parseCampaignExcel = async (fileName: string, base64Data: string) => {
  try {
    const response = await api.post('/campaigns/parse-excel', { fileName, base64Data });
    return response.data;
  } catch (error) {
    console.error('Error parsing campaign Excel:', error);
    throw error;
  }
};

export const getCampaigns = async () => {
  try {
    const response = await api.get('/campaigns');
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const getCampaign = async (id: string) => {
  try {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

export const createCampaign = async (data: any) => {
  try {
    const response = await api.post('/campaigns', data);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const updateCampaign = async (id: string, data: any) => {
  try {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

export const sendCampaign = async (id: string) => {
  try {
    const response = await api.post(`/campaigns/${id}/send`);
    return response.data;
  } catch (error) {
    console.error('Error sending campaign:', error);
    throw error;
  }
};

export const pauseCampaign = async (id: string) => {
  try {
    const response = await api.post(`/campaigns/${id}/pause`);
    return response.data;
  } catch (error) {
    console.error('Error pausing campaign:', error);
    throw error;
  }
};

export const resumeCampaign = async (id: string) => {
  try {
    const response = await api.post(`/campaigns/${id}/resume`);
    return response.data;
  } catch (error) {
    console.error('Error resuming campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (id: string) => {
  try {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

// ========== REMINDERS ==========
export const parseReminderExcel = async (fileName: string, base64Data: string) => {
  try {
    const response = await api.post('/reminders/parse-excel', { fileName, base64Data });
    return response.data;
  } catch (error) {
    console.error('Error parsing reminder Excel:', error);
    throw error;
  }
};

export const getReminders = async () => {
  try {
    const response = await api.get('/reminders');
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

export const getReminder = async (id: string) => {
  try {
    const response = await api.get(`/reminders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reminder:', error);
    throw error;
  }
};

export const createReminder = async (data: {
  name: string;
  messageTemplate: string;
  whatsappConnectionId: string | null;
  scheduleType?: string;
  scheduledAt?: string | null;
  recurringCron?: string | null;
  delayMs?: number;
  contacts: Array<{ phone: string; variables: Record<string, string> }>;
  imageBase64?: string | null;
  metaTemplateName?: string;
  metaTemplateLanguage?: string;
}) => {
  try {
    const response = await api.post('/reminders', data);
    return response.data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

export const updateReminder = async (id: string, data: any) => {
  try {
    const response = await api.put(`/reminders/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

export const sendReminder = async (id: string) => {
  try {
    const response = await api.post(`/reminders/${id}/send`);
    return response.data;
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
};

export const pauseReminder = async (id: string) => {
  try {
    const response = await api.post(`/reminders/${id}/pause`);
    return response.data;
  } catch (error) {
    console.error('Error pausing reminder:', error);
    throw error;
  }
};

export const resumeReminder = async (id: string) => {
  try {
    const response = await api.post(`/reminders/${id}/resume`);
    return response.data;
  } catch (error) {
    console.error('Error resuming reminder:', error);
    throw error;
  }
};

export const cancelReminder = async (id: string) => {
  try {
    const response = await api.post(`/reminders/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    throw error;
  }
};

export const deleteReminder = async (id: string) => {
  try {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

// ========== MESSAGE TEMPLATES ==========
export const getMessageTemplates = async (category?: string) => {
  try {
    const params = category && category !== 'all' ? { category } : {};
    const response = await api.get('/message-templates', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching message templates:', error);
    throw error;
  }
};

export const getMessageTemplate = async (id: string) => {
  try {
    const response = await api.get(`/message-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching message template:', error);
    throw error;
  }
};

export const getMessageTemplateStats = async () => {
  try {
    const response = await api.get('/message-templates/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching message template stats:', error);
    throw error;
  }
};

export const createMessageTemplate = async (data: {
  name: string;
  category: string;
  content: string;
}) => {
  try {
    const response = await api.post('/message-templates', data);
    return response.data;
  } catch (error) {
    console.error('Error creating message template:', error);
    throw error;
  }
};

export const updateMessageTemplate = async (id: string, data: {
  name?: string;
  category?: string;
  content?: string;
}) => {
  try {
    const response = await api.put(`/message-templates/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating message template:', error);
    throw error;
  }
};

export const deleteMessageTemplate = async (id: string) => {
  try {
    const response = await api.delete(`/message-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message template:', error);
    throw error;
  }
};

export default api;
