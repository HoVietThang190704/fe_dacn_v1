/**
 * Repository Implementation: Support
 * Implements domain repository interface using data sources
 */
import { ISupportRepository, CreateTicketDto } from '@/domain/repositories/ISupportRepository';
import { SupportTicket, FAQ, TicketStatus } from '@/domain/entities/Support';
import { SupportApiDataSource } from '../datasources/SupportApiDataSource';

export class SupportRepositoryImpl implements ISupportRepository {
  constructor(private apiDataSource: SupportApiDataSource) {}

  async getTickets(userId: string): Promise<SupportTicket[]> {
    return await this.apiDataSource.getTickets(userId);
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    return await this.apiDataSource.getTicketById(id);
  }

  async createTicket(ticket: CreateTicketDto): Promise<SupportTicket> {
    return await this.apiDataSource.createTicket(ticket);
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    return await this.apiDataSource.updateTicketStatus(ticketId, status);
  }

  async getFAQs(category?: string): Promise<FAQ[]> {
    return await this.apiDataSource.getFAQs(category);
  }

  async searchFAQs(query: string): Promise<FAQ[]> {
    return await this.apiDataSource.searchFAQs(query);
  }
}
