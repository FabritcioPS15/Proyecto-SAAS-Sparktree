/**
 * WhatsApp Type Definitions
 * 
 * Strict TypeScript interfaces for WhatsApp-related payloads and data structures
 * to ensure type safety and prevent runtime errors (RNF-03)
 */

// ========================================
// Connection Status Types
// ========================================
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WhatsAppConnection {
  id: string;
  userId: string;
  organizationId: string;
  displayName: string;
  phoneNumber?: string;
  status: ConnectionStatus;
  socket?: any;
  qr?: string;
  authStatePath?: string;
  lastConnectedAt?: Date;
}

// ========================================
// Message Types
// ========================================
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact' | 'interactive';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface TextMessage {
  body: string;
}

export interface InteractiveMessage {
  type: 'button_reply' | 'list_reply';
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description: string;
  };
}

export interface MediaMessage {
  type: 'image' | 'video' | 'audio' | 'document';
  url?: string;
  caption?: string;
  filename?: string;
  mimetype?: string;
}

export interface LocationMessage {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface ContactMessage {
  name: {
    first_name: string;
    last_name?: string;
  };
  phone?: string;
}

export interface FormattedMessage {
  id: string;
  from: string;
  jid?: string;
  type: MessageType;
  text?: TextMessage;
  interactive?: InteractiveMessage;
  media?: MediaMessage;
  location?: LocationMessage;
  contact?: ContactMessage;
  isNumericButtonResponse?: boolean;
  buttonNumber?: string;
}

// ========================================
// Session Persistence Types
// ========================================
export interface AuthState {
  creds: any;
  keys: Record<string, any>;
}

export interface WhatsAppSession {
  id: string;
  whatsapp_connection_id: string;
  organization_id: string;
  auth_state: AuthState;
  user_jid?: string;
  phone_number?: string;
  device_id?: string;
  is_active: boolean;
  last_restored_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// Message Queue Types
// ========================================
export interface MessageQueueJob {
  messageId: string;
  connectionId: string;
  organizationId: string;
  conversationId: string;
  contactId: string;
  senderPhone: string;
  message: FormattedMessage;
  timestamp: string;
}

// ========================================
// WebSocket Event Types
// ========================================
export interface ConnectionStatusUpdate {
  connectionId: string;
  status: ConnectionStatus;
  qr?: string;
  phoneNumber?: string;
  timestamp: string;
}

export interface QRCodeUpdate {
  connectionId: string;
  qr: string;
  timestamp: string;
}

// ========================================
// Organization Config Types
// ========================================
export interface OrganizationConfig {
  organizationId?: string;
  conversationId?: string;
  contactId?: string;
  whatsappConnectionId?: string;
  senderJid?: string;
}

// ========================================
// API Response Types
// ========================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ConnectionStatusResponse {
  id: string;
  status: ConnectionStatus;
  qr?: string;
  displayName: string;
  phoneNumber?: string;
}

// ========================================
// Flow Engine Types
// ========================================
export interface FlowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  data?: any;
}

export interface Flow {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  triggers: any[];
  is_active: boolean;
  is_default: boolean;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  version: string;
  category: 'sales' | 'support' | 'marketing' | 'onboarding' | 'other';
  bot_mode: string;
  fallback_message: string;
  metrics: any;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
