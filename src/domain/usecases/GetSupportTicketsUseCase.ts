import { ISupportRepository } from '../repositories/ISupportRepository';
import { SupportTicket, FAQ } from '../entities/Support';

export class GetSupportDataUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(params?: { locale?: string; category?: string }): Promise<{
    tickets: SupportTicket[];
    faqs: FAQ[];
  }> {
    const [tickets, faqs] = await Promise.all([
      this.supportRepository.getTickets(),
      this.supportRepository.getFAQs({
        locale: params?.locale,
        category: params?.category,
      })
    ]);

    return { tickets, faqs };
  }
}
