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
  const savedSession = localStorage.getItem('sparktree_session');
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
    throw error;
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

export const adminLogin = async () => {
  try {
    const response = await api.post('/auth/admin-login');
    return response.data;
  } catch (error) {
    console.error('Error admin login:', error);
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
export const getCatalogs = async () => {
  try {
    const response = await api.get('/catalogs');
    return response.data;
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    throw error;
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

export default api;
