/**
 * Data Source: Support API
 * Handles HTTP requests to support endpoints
 */
import { SupportTicket, FAQ, TicketStatus } from '@/domain/entities/Support';
import { CreateTicketDto } from '@/domain/repositories/ISupportRepository';

export class SupportApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTickets(userId: string): Promise<SupportTicket[]> {
    const response = await fetch(`${this.baseUrl}/support/tickets?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    const response = await fetch(`${this.baseUrl}/support/tickets/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ticket: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async createTicket(ticket: CreateTicketDto): Promise<SupportTicket> {
    const response = await fetch(`${this.baseUrl}/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticket),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    const response = await fetch(`${this.baseUrl}/support/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update ticket status: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getFAQs(category?: string): Promise<FAQ[]> {
    const url = category
      ? `${this.baseUrl}/support/faqs?category=${category}`
      : `${this.baseUrl}/support/faqs`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch FAQs: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async searchFAQs(query: string): Promise<FAQ[]> {
    const response = await fetch(`${this.baseUrl}/support/faqs/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search FAQs: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
