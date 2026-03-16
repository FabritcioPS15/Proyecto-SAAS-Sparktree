// types/index.ts - Exportar todos los tipos
export * from './whatsapp';
export * from './organization';
export * from './flow';
export * from './common';

// Importar tipos para uso interno desde los módulos correctos
import { WhatsAppNumber, Conversation, WhatsAppStats } from './whatsapp';
import { User, Organization, OrganizationStats } from './organization';
import { Flow, FlowNode, FlowEdge, FlowImportExport } from './flow';
import { NotificationItem } from './common';

// Tipos combinados útiles
export interface DashboardData {
  user: User;
  organization?: Organization;
  whatsappNumbers: WhatsAppNumber[];
  conversations: Conversation[];
  flows: Flow[];
  stats: {
    total: OrganizationStats;
    whatsapp: WhatsAppStats;
    flows: {
      total: number;
      active: number;
      draft: number;
      paused: number;
    };
  };
}

export interface AppContextType {
  user: User | null;
  organization: Organization | null;
  selectedWhatsAppNumber: WhatsAppNumber | null;
  theme: 'light' | 'dark' | 'auto';
  loading: boolean;
  error: string | null;
  notifications: NotificationItem[];
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setSelectedWhatsAppNumber: (number: WhatsAppNumber | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
}

export interface ComponentSize {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Tipos para el Flow Builder mejorados
export interface FlowBuilderState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: FlowNode | null;
  selectedEdge: FlowEdge | null;
  clipboard: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  } | null;
  history: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  }[];
  historyIndex: number;
  zoom: number;
  pan: Position;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FlowBuilderActions {
  addNode: (node: FlowNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  addEdge: (edge: FlowEdge) => void;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, updates: Partial<FlowEdge>) => void;
  selectNode: (node: FlowNode | null) => void;
  selectEdge: (edge: FlowEdge | null) => void;
  copySelection: () => void;
  pasteSelection: () => void;
  deleteSelection: () => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;
  validateFlow: () => void;
  saveFlow: () => Promise<void>;
  loadFlow: (flowId: string) => Promise<void>;
  exportFlow: () => void;
  importFlow: (data: FlowImportExport) => void;
}

// Tipos para Chat Interface
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: any;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  error: string | null;
  typing: Record<string, boolean>;
  unreadCounts: Record<string, number>;
  searchQuery: string;
  filters: {
    status?: string;
    assignedAgent?: string;
    dateRange?: [string, string];
    tags?: string[];
  };
}

export interface ChatActions {
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  assignAgent: (conversationId: string, agentId: string) => Promise<void>;
  updateStatus: (conversationId: string, status: Conversation['status']) => Promise<void>;
  addTag: (conversationId: string, tag: string) => Promise<void>;
  removeTag: (conversationId: string, tag: string) => Promise<void>;
  searchConversations: (query: string) => void;
  setFilters: (filters: Partial<ChatState['filters']>) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
}

// Tipos para Analytics
export interface AnalyticsData {
  conversations: {
    total: number;
    new: number;
    active: number;
    closed: number;
    averageDuration: number;
    byStatus: Record<string, number>;
    byAgent: Record<string, number>;
    byHour: Record<string, number>;
    byDay: Record<string, number>;
  };
  messages: {
    total: number;
    sent: number;
    received: number;
    averageResponseTime: number;
    byType: Record<string, number>;
    byHour: Record<string, number>;
    byDay: Record<string, number>;
  };
  agents: {
    total: number;
    active: number;
    averageResponseTime: number;
    satisfactionScore: number;
    conversationsHandled: number;
    byPerformance: Array<{
      agentId: string;
      agentName: string;
      conversations: number;
      responseTime: number;
      satisfaction: number;
    }>;
  };
  flows: {
    total: number;
    active: number;
    executions: number;
    completionRate: number;
    averageExecutionTime: number;
    byFlow: Array<{
      flowId: string;
      flowName: string;
      executions: number;
      completions: number;
      errors: number;
      averageTime: number;
    }>;
  };
}

export interface AnalyticsFilters {
  dateRange: [string, string];
  organization?: string;
  whatsappNumber?: string;
  agent?: string;
  flow?: string;
  status?: string;
}

export interface AnalyticsActions {
  loadData: (filters: AnalyticsFilters) => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  refreshData: () => Promise<void>;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
}

// Mantener compatibilidad con tipos antiguos
export interface Message {
  id: string;
  userId: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface Interaction {
  id: string;
  userId: string;
  menuOption: string;
  timestamp: string;
}

export interface MenuOption {
  option: string;
  count: number;
}

export interface Settings {
  botName: string;
  webhookUrl: string;
  systemStatus: 'active' | 'inactive';
}
