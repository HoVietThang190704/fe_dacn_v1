import { ISupportRepository } from '../repositories/ISupportRepository';
import { SupportChatMessage, SupportChatThread } from '../entities/Support';

export class SendSupportChatMessageUseCase {
  constructor(private readonly supportRepository: ISupportRepository) {}

  async execute(content: string): Promise<{ message: SupportChatMessage; thread: SupportChatThread }> {
    if (!content?.trim()) {
      throw new Error('Message is required');
    }
    return this.supportRepository.sendChatMessage(content.trim());
  }
}
