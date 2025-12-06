import { ISupportRepository } from '@/domain/repositories/ISupportRepository';
import { SupportTicket, FAQ, TicketStatus, CreateSupportTicketInput } from '@/domain/entities/Support';
import { SupportApiDataSource } from '../datasources/SupportApiDataSource';

export class SupportRepositoryImpl implements ISupportRepository {
  constructor(private apiDataSource: SupportApiDataSource) {}

  async getTickets(): Promise<SupportTicket[]> {
    return await this.apiDataSource.getTickets();
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    return await this.apiDataSource.getTicketById(id);
  }

  async createTicket(ticket: CreateSupportTicketInput): Promise<SupportTicket> {
    return await this.apiDataSource.createTicket(ticket);
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    return await this.apiDataSource.updateTicketStatus(ticketId, status);
  }

  async getFAQs(params?: { category?: string; locale?: string }): Promise<FAQ[]> {
    return await this.apiDataSource.getFAQs(params);
  }

  async searchFAQs(query: string, locale?: string): Promise<FAQ[]> {
    return await this.apiDataSource.searchFAQs(query, locale);
  }

  async voteOnFAQ(faqId: string, vote: 'helpful' | 'not_helpful') {
    return await this.apiDataSource.voteFaq(faqId, vote);
  }

  async getChatThread() {
    return await this.apiDataSource.getChatThread();
  }

  async sendChatMessage(content: string) {
    return await this.apiDataSource.sendChatMessage(content);
  }

  async markChatThreadRead() {
    return await this.apiDataSource.markChatThreadRead();
  }
}
