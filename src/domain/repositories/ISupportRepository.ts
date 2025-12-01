import { SupportTicket, FAQ, TicketStatus, CreateSupportTicketInput, SupportChatThread, SupportChatMessage } from '../entities/Support';

export interface ISupportRepository {
  getTickets(): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket>;
  createTicket(ticket: CreateSupportTicketInput): Promise<SupportTicket>;
  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket>;
  getFAQs(params?: { category?: string; locale?: string }): Promise<FAQ[]>;
  searchFAQs(query: string, locale?: string): Promise<FAQ[]>;
  voteOnFAQ(faqId: string, vote: 'helpful' | 'not_helpful'): Promise<{
    faqId: string;
    helpful: number;
    notHelpful: number;
    userVote?: 'helpful' | 'not_helpful' | null;
  }>;
  getChatThread(): Promise<SupportChatThread | null>;
  sendChatMessage(content: string): Promise<{ message: SupportChatMessage; thread: SupportChatThread }>;
  markChatThreadRead(): Promise<SupportChatThread | null>;
}
