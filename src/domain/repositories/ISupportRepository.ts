/**
 * Domain Repository Interface
 * Defines contract for support data access
 */
import { SupportTicket, FAQ, TicketStatus } from '../entities/Support';

export interface ISupportRepository {
  getTickets(userId: string): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket>;
  createTicket(ticket: CreateTicketDto): Promise<SupportTicket>;
  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket>;
  getFAQs(category?: string): Promise<FAQ[]>;
  searchFAQs(query: string): Promise<FAQ[]>;
}

export interface CreateTicketDto {
  userId: string;
  subject: string;
  description: string;
  category: string;
  attachments?: string[];
}
