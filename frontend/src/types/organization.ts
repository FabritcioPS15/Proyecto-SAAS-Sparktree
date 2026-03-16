// types/organization.ts
export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  industry: 'retail' | 'services' | 'healthcare' | 'education' | 'finance' | 'technology' | 'other';
  status: 'active' | 'suspended' | 'trial';
  created_at: string;
  updated_at: string;
  owner_id?: string;
  subscription_id?: string;
  trial_end?: string;
  suspended_at?: string;
  suspension_reason?: string;
  billing_email?: string;
  website?: string;
  address?: string;
  logo_url?: string;
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  allow_user_registration: boolean;
  require_approval: boolean;
  default_user_role: 'admin' | 'member';
  max_users: number;
  max_whatsapp_numbers: number;
  monthly_message_limit: number;
  features: {
    flows: boolean;
    analytics: boolean;
    api_access: boolean;
    multi_number: boolean;
    advanced_routing: boolean;
    chatbots: boolean;
    broadcasts: boolean;
  };
  branding: {
    primary_color: string;
    secondary_color: string;
    logo_url?: string;
    company_name: string;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    webhook_notifications: boolean;
    new_message_alert: boolean;
    conversation_assigned: boolean;
  };
}

export interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  assigned_whatsapp_numbers: string[];
  default_whatsapp_number?: string;
  created_at: string;
  updated_at: string;
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  last_login?: string;
  user?: User;
  organization?: Organization;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  phone?: string;
  global_role: 'super_admin' | 'user';
  company_role?: 'admin' | 'member';
  organization_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  settings?: UserSettings;
  organizations?: Organization[];
  current_organization?: Organization;
}

export interface UserSettings {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    desktop: boolean;
  };
  chat: {
    sound_enabled: boolean;
    auto_open_conversations: boolean;
    show_typing_indicators: boolean;
    mark_as_read_delay: number;
  };
  privacy: {
    show_online_status: boolean;
    show_last_seen: boolean;
    allow_profile_search: boolean;
  };
}

export interface OrganizationStats {
  total_users: number;
  active_users: number;
  total_numbers: number;
  connected_numbers: number;
  total_conversations: number;
  active_conversations: number;
  pending_conversations: number;
  messages_today: number;
  messages_this_week: number;
  messages_this_month: number;
  average_response_time: number;
  satisfaction_score?: number;
  storage_used: number;
  storage_limit: number;
  api_calls_today: number;
  api_calls_limit: number;
}

export interface OrganizationMetrics {
  id: string;
  organization_id: string;
  metric_date: string;
  total_conversations: number;
  messages_sent: number;
  messages_received: number;
  active_users: number;
  new_users: number;
  storage_used: number;
  api_calls: number;
  response_time_avg: number;
  satisfaction_score?: number;
  created_at: string;
  updated_at: string;
}
