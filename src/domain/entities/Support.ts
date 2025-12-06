export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REJECTED = 'rejected'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export type TicketType = 'support' | 'bug' | 'feature' | 'question' | 'refund' | 'other';

export interface SupportTicketAttachment {
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber?: string | null;
  title: string;
  description?: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo?: string | null;
  relatedShopId?: string | null;
  relatedShopReference?: string | null;
  relatedOrderId?: string | null;
  relatedOrderReference?: string | null;
  tags?: string[];
  attachments?: SupportTicketAttachment[];
  commentsCount?: number;
  isPublic?: boolean;
  resolutionMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'not_helpful' | null;
}

export type SupportChatSender = 'user' | 'admin' | 'system';

export interface SupportChatMessage {
  id: string;
  sender: SupportChatSender;
  senderName?: string | null;
  senderRole?: 'user' | 'admin' | null;
  content: string;
  createdAt: Date;
}

export interface SupportChatThread {
  threadId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  userAvatar?: string | null;
  lastMessage?: string | null;
  lastSender?: SupportChatSender | null;
  lastMessageAt?: Date | null;
  unreadByAdmin?: number;
  unreadByUser?: number;
  messages: SupportChatMessage[];
}

export interface CreateSupportTicketInput {
  title: string;
  description?: string;
  type?: TicketType;
  priority?: TicketPriority;
  relatedOrderId?: string;
  relatedOrderReference?: string;
  relatedShopId?: string;
  relatedShopReference?: string;
  attachments?: SupportTicketAttachment[];
  isPublic?: boolean;
}
