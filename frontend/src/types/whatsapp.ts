// types/whatsapp.ts
export interface WhatsAppNumber {
  id: string;
  organization_id: string;
  phone_number: string;
  display_name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  webhook_url?: string;
  qr_code?: string;
  session_data?: any;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  assigned_users: string[]; // Array de user IDs
  default_user?: string; // user ID por defecto
}

export interface WhatsAppConfig {
  id: string;
  whatsapp_number_id: string;
  webhook_url: string;
  auto_reply_enabled: boolean;
  auto_reply_delay: number;
  business_hours: {
    enabled: boolean;
    monday: { enabled: boolean; start: string; end: string };
    tuesday: { enabled: boolean; start: string; end: string };
    wednesday: { enabled: boolean; start: string; end: string };
    thursday: { enabled: boolean; start: string; end: string };
    friday: { enabled: boolean; start: string; end: string };
    saturday: { enabled: boolean; start: string; end: string };
    sunday: { enabled: boolean; start: string; end: string };
  };
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  whatsapp_number_id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  media_url?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
  sender_id?: string;
  recipient_id?: string;
  metadata?: any;
}

export interface WhatsAppContact {
  id: string;
  phone_number: string;
  name?: string;
  profile_pic_url?: string;
  last_seen?: string;
  is_blocked: boolean;
  is_contact: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  whatsapp_number_id: string;
  contact_id: string;
  assigned_agent?: string;
  status: 'active' | 'pending' | 'closed' | 'archived';
  last_message_at: string;
  last_message_content: string;
  unread_count: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface WhatsAppStats {
  total_conversations: number;
  active_conversations: number;
  pending_conversations: number;
  messages_today: number;
  messages_this_week: number;
  messages_this_month: number;
  average_response_time: number;
  response_rate: number;
  satisfaction_score?: number;
}

export interface WhatsAppNumberSelector {
  numbers: WhatsAppNumber[];
  selectedNumber: string;
  onNumberChange: (numberId: string) => void;
  disabled?: boolean;
  showStatus?: boolean;
  showAssignedUsers?: boolean;
}

export interface WhatsAppConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  qrCode?: string;
  error?: string;
  lastConnectedAt?: string;
  phoneInfo?: {
    phone: string;
    name: string;
    picture?: string;
  };
}
