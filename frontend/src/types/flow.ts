// types/flow.ts
export interface FlowNode {
  id: string;
  type: 'trigger' | 'text' | 'interactive' | 'media' | 'capture' | 'webhook' | 'handoff' | 'delay' | 'condition' | 'analytics';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    // Trigger specific
    keywords?: string[];
    trigger_type?: 'keyword' | 'command' | 'always';
    // Text specific
    message?: string;
    // Interactive specific
    buttons?: Array<{ id: string; text: string; action?: string }>;
    lists?: Array<{ id: string; title: string; options: Array<{ id: string; text: string; description?: string }> }>;
    // Media specific
    media_type?: 'image' | 'video' | 'audio' | 'document';
    media_url?: string;
    // Capture specific
    capture_type?: 'text' | 'email' | 'phone' | 'number' | 'date' | 'choice';
    variable_name?: string;
    required?: boolean;
    validation?: {
      pattern?: string;
      min_length?: number;
      max_length?: number;
      custom_message?: string;
    };
    // Webhook specific
    webhook_url?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    // Handoff specific
    handoff_type?: 'agent' | 'department' | 'queue';
    target?: string;
    // Delay specific
    delay_seconds?: number;
    // Condition specific
    condition_type?: 'if' | 'switch';
    conditions?: Array<{
      variable: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
      value: string | number;
      next_node?: string;
    }>;
    // Analytics specific
    analytics_type?: 'track' | 'segment' | 'goal';
    event_name?: string;
    properties?: Record<string, any>;
  };
  config?: {
    timeout?: number;
    retry_count?: number;
    error_handling?: 'skip' | 'retry' | 'fallback';
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'condition' | 'button' | 'list_option';
  label?: string;
  condition?: string;
  animated?: boolean;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  whatsapp_number_id?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  triggers: string[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  category: 'customer_service' | 'sales' | 'marketing' | 'support' | 'onboarding' | 'feedback' | 'other';
  bot_mode: 'triggers_only' | 'general_response';
  fallback_message: string;
  settings: FlowSettings;
  analytics?: FlowAnalytics;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  version: number;
  tags: string[];
  is_public: boolean;
}

export interface FlowSettings {
  auto_save: boolean;
  save_interval: number;
  allow_duplicates: boolean;
  max_execution_time: number;
  error_handling: 'stop' | 'continue' | 'fallback';
  logging: boolean;
  analytics: boolean;
  notifications: {
    on_error: boolean;
    on_completion: boolean;
    on_timeout: boolean;
  };
  security: {
    rate_limiting: boolean;
    max_requests_per_minute: number;
    allowed_origins?: string[];
  };
}

export interface FlowAnalytics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time: number;
  completion_rate: number;
  error_rate: number;
  most_used_nodes: Array<{
    node_id: string;
    node_type: string;
    count: number;
  }>;
  dropoff_points: Array<{
    node_id: string;
    node_type: string;
    dropoff_count: number;
    dropoff_rate: number;
  }>;
  popular_paths: Array<{
    path: string[];
    count: number;
    completion_rate: number;
  }>;
  last_updated: string;
}

export interface FlowExecution {
  id: string;
  flow_id: string;
  conversation_id: string;
  whatsapp_number_id: string;
  contact_id: string;
  status: 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  current_node_id?: string;
  execution_path: Array<{
    node_id: string;
    node_type: string;
    timestamp: string;
    duration: number;
    success: boolean;
    error?: string;
  }>;
  variables: Record<string, any>;
  started_at: string;
  completed_at?: string;
  timeout_at?: string;
  error_message?: string;
  metadata?: any;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  settings: FlowSettings;
  tags: string[];
  is_premium: boolean;
  usage_count: number;
  rating?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FlowImportExport {
  version: string;
  flow: Flow;
  dependencies?: {
    media_files?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
    webhooks?: Array<{
      name: string;
      url: string;
      description: string;
    }>;
  };
  metadata?: {
    exported_at: string;
    exported_by: string;
    original_organization?: string;
  };
}
