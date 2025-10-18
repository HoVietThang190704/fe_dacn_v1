/**
 * Use Case: Get Support Tickets
 * Business logic for fetching support tickets
 */
import { ISupportRepository } from '../repositories/ISupportRepository';
import { SupportTicket, FAQ } from '../entities/Support';

export class GetSupportDataUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(userId: string): Promise<{
    tickets: SupportTicket[];
    faqs: FAQ[];
  }> {
    const [tickets, faqs] = await Promise.all([
      this.supportRepository.getTickets(userId),
      this.supportRepository.getFAQs()
    ]);

    return { tickets, faqs };
  }
}
