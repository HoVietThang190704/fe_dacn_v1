import { ISupportRepository } from '../repositories/ISupportRepository';
import { CreateSupportTicketInput, SupportTicket } from '../entities/Support';

export class CreateSupportTicketUseCase {
  constructor(private readonly supportRepository: ISupportRepository) {}

  async execute(input: CreateSupportTicketInput): Promise<SupportTicket> {
    return this.supportRepository.createTicket(input);
  }
}
