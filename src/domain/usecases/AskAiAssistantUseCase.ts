import { AiAssistantResponse } from '../entities/AiAssistant';
import { AiAssistantChatRequest, IAiAssistantRepository } from '../repositories/IAiAssistantRepository';

export class AskAiAssistantUseCase {
  constructor(private readonly repository: IAiAssistantRepository) {}

  execute(payload: AiAssistantChatRequest): Promise<AiAssistantResponse> {
    return this.repository.chat(payload);
  }
}
