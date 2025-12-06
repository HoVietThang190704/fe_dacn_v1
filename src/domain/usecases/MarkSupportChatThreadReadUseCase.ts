import { ISupportRepository } from '../repositories/ISupportRepository';
import { SupportChatThread } from '../entities/Support';

export class MarkSupportChatThreadReadUseCase {
  constructor(private readonly supportRepository: ISupportRepository) {}

  async execute(): Promise<SupportChatThread | null> {
    return this.supportRepository.markChatThreadRead();
  }
}
