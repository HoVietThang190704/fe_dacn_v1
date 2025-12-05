import { API_ENDPOINTS, API_CONFIG } from '@/shared/constants/api';
import { AiAssistantHistoryItem, AiAssistantResponse } from '@/domain/entities/AiAssistant';

interface ChatApiResponse {
  success?: boolean;
  data?: AiAssistantResponse;
  message?: string;
}

export class AiAssistantApiDataSource {
  private readonly endpoint: string;

  constructor(private readonly baseUrl: string = API_CONFIG.BASE_URL) {
    this.endpoint = this.buildUrl(API_ENDPOINTS.AI_CHAT);
  }

  async chat(payload: {
    message: string;
    locale?: string;
    history?: AiAssistantHistoryItem[];
  }): Promise<AiAssistantResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data: ChatApiResponse = await response.json().catch(() => ({}));

    if (!response.ok || data?.success === false || !data?.data) {
      const message = data?.message || 'Unable to contact AI assistant at the moment.';
      throw new Error(message);
    }

    return data.data;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl || ''}${normalized}`;
  }
}
