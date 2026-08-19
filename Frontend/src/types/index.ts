// ============================================================================
// ADVMEN SalesOS — Core Type Definitions
// ============================================================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_REP'
  | 'TELECALLER'
  | 'MARKETING_SDR'
  | 'FINANCE_VIEWER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  permissions: string[];
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'NURTURING' | 'CONVERTED';

export type LeadScoreCategory = 'HOT' | 'WARM' | 'COLD';

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  score: number; // 0 - 100
  scoreCategory: LeadScoreCategory;
  assignedTo: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  source: 'WEBSITE' | 'LINKEDIN' | 'INBOUND_CALL' | 'REFERRAL' | 'META_ADS';
  estimatedValue: number;
  tags?: string[];
  lastContactedAt?: string;
  createdAt: string;
  aiSummary?: {
    overview: string;
    intentLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestedAction: string;
    keyPoints: string[];
    isApproved?: boolean;
  };
}

export type DealStage = 'DISCOVERY' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Deal {
  id: string;
  organizationId: string;
  title: string;
  leadId?: string;
  company: string;
  contactName: string;
  value: number;
  stage: DealStage;
  probability: number; // 0 - 100
  expectedCloseDate: string;
  assignedTo: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  health: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
}

export type CallStatus = 'QUEUED' | 'RINGING' | 'CONNECTED' | 'COMPLETED' | 'MISSED' | 'BUSY';
export type CallDisposition = 'INTERESTED' | 'CALLBACK_REQUESTED' | 'NOT_INTERESTED' | 'WRONG_NUMBER' | 'MEETING_BOOKED' | 'VOICEMAIL';

export interface CallRecord {
  id: string;
  organizationId: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadCompany: string;
  callerId: string;
  callerName: string;
  status: CallStatus;
  disposition?: CallDisposition;
  durationSeconds: number;
  recordingUrl?: string;
  transcriptSnippet?: string;
  aiSentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  notes?: string;
  scheduledAt?: string;
  completedAt?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'CALL' | 'EMAIL' | 'WHATSAPP' | 'STAGE_CHANGE' | 'NOTE' | 'TASK' | 'MEETING' | 'AI_INSIGHT';
  title: string;
  description: string;
  actorName: string;
  actorAvatar?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  dueDate: string;
  isOverdue?: boolean;
  isCompleted: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  relatedTo: {
    type: 'LEAD' | 'DEAL' | 'ACCOUNT';
    id: string;
    name: string;
  };
  assignedToName: string;
  slaBreachInMinutes?: number;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  dealId: string;
  dealTitle: string;
  company: string;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'DECLINED';
  validUntil: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dealId?: string;
  leadId?: string;
  company: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  contactName: string;
  contactChannel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  contactAddress: string;
  lastMessageSnippet: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    sender: 'USER' | 'CONTACT' | 'AI_DRAFT';
    content: string;
    timestamp: string;
    status?: 'SENT' | 'DELIVERED' | 'READ' | 'SUGGESTED';
  }>;
}
