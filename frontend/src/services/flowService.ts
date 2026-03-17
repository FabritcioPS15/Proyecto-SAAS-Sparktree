const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface FlowBot {
  id: string;      // Made 'id' mandatory to match Supabase/Backend
  _id?: string;    // Keep _id as optional for legacy compatibility
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;
  lastModified: string;
  nodes: any[];
  edges: any[];
  triggers: string[];
  category: 'sales' | 'support' | 'marketing' | 'onboarding' | 'other';
  metrics: {
    conversations: number;
    completionRate: number;
    avgResponseTime: number;
    satisfaction: number;
  };
  assignedTo?: string;
  isDefault: boolean;
}

export interface CreateFlowData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  version?: string;
  category?: 'sales' | 'support' | 'marketing' | 'onboarding' | 'other';
  triggers?: string[];
  assigned_to?: string | null;
  is_default?: boolean;
  metrics?: {
    conversations: number;
    completionRate: number;
    avgResponseTime: number;
    satisfaction: number;
  };
  nodes?: any[];
  edges?: any[];
}

class FlowService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all flows
  async getFlows(): Promise<FlowBot[]> {
    return this.request<FlowBot[]>('/flows');
  }

  // Get a single flow by ID
  async getFlow(id: string): Promise<FlowBot> {
    return this.request<FlowBot>(`/flows/${id}`);
  }

  // Create a new flow
  async createFlow(flowData: CreateFlowData): Promise<FlowBot> {
    return this.request<FlowBot>('/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  }

  // Update an existing flow
  async updateFlow(id: string, flowData: Partial<CreateFlowData>): Promise<FlowBot> {
    return this.request<FlowBot>(`/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flowData),
    });
  }

  // Delete a flow
  async deleteFlow(id: string): Promise<void> {
    const url = `${API_BASE_URL}/flows/${id}`;
    
    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for /flows/${id}:`, error);
      throw error;
    }
  }

  // Duplicate a flow
  async duplicateFlow(id: string): Promise<FlowBot> {
    return this.request<FlowBot>(`/flows/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Toggle flow status
  async toggleFlowStatus(id: string): Promise<FlowBot> {
    // First get the current flow to determine the new status
    const currentFlow = await this.getFlow(id);
    const newStatus = currentFlow.status === 'active' ? 'inactive' : 'active';

    return this.updateFlow(id, { status: newStatus });
  }
}

export const flowService = new FlowService();
