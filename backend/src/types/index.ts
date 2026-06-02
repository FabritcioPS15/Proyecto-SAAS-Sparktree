// Shared TypeScript types for the application

export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  max_whatsapp_connections: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  name?: string;
  full_name?: string;
  role: 'super_admin' | 'admin' | 'staff' | 'empresa' | 'agent';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  phone_number: string;
  profile_name?: string;
  bot_state?: string;
  custom_attributes?: Record<string, any>;
  last_active_at: string;
  created_at: string;
  profile_picture?: string;
}

export interface Conversation {
  id: string;
  organization_id: string;
  contact_id: string;
  status: 'open' | 'closed' | 'archived';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assigned_at?: string;
  assignment_type?: 'manual' | 'round_robin' | 'load_balance' | 'auto';
  department?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_transferred?: boolean;
  transferred_from?: string;
  transferred_at?: string;
  transfer_reason?: string;
}

export interface Message {
  id: string;
  organization_id: string;
  conversation_id: string;
  contact_id: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
  content?: string;
  media_url?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

export interface Flow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  triggers: any[];
  is_active: boolean;
  is_default: boolean;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  version: string;
  category: 'sales' | 'support' | 'marketing' | 'onboarding' | 'other';
  bot_mode: string;
  fallback_message?: string;
  metrics?: Record<string, any>;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformConnection {
  id: string;
  user_id: string;
  organization_id: string;
  platform_type: 'whatsapp' | 'telegram' | 'instagram' | 'tiktok' | 'facebook_messenger' | 'mercadolibre';
  display_name: string;
  platform_account_id?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  config: Record<string, any>;
  last_connected_at?: string;
}

export interface InternalNote {
  id: string;
  organization_id: string;
  conversation_id: string;
  user_id: string;
  note: string;
  is_visible_to_all: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentWorkload {
  id: string;
  organization_id: string;
  user_id: string;
  active_conversations: number;
  total_conversations_today: number;
  avg_response_time_seconds: number;
  last_assigned_at?: string;
  is_online: boolean;
  is_available: boolean;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptions {
  platform?: string;
  status?: string;
  assignedTo?: string;
  priority?: string;
  department?: string;
  limit?: number;
  offset?: number;
}

export interface AssignmentOptions {
  conversationId: string;
  userId?: string;
  departmentId?: string;
  reason?: string;
}
