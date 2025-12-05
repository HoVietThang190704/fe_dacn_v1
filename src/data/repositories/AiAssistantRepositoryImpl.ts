import { AiAssistantChatRequest, IAiAssistantRepository } from '@/domain/repositories/IAiAssistantRepository';
import { AiAssistantApiDataSource } from '../datasources/AiAssistantApiDataSource';
import { AiAssistantResponse } from '@/domain/entities/AiAssistant';

export class AiAssistantRepositoryImpl implements IAiAssistantRepository {
  constructor(private readonly dataSource: AiAssistantApiDataSource) {}

  chat(payload: AiAssistantChatRequest): Promise<AiAssistantResponse> {
    return this.dataSource.chat(payload);
  }
}
