import { AiAssistantHistoryItem, AiAssistantResponse } from '../entities/AiAssistant';

export interface AiAssistantChatRequest {
  message: string;
  locale?: string;
  history?: AiAssistantHistoryItem[];
}

export interface IAiAssistantRepository {
  chat(payload: AiAssistantChatRequest): Promise<AiAssistantResponse>;
}
