export type AiAssistantRole = 'user' | 'assistant' | 'system';

export interface AiAssistantHistoryItem {
  role: Exclude<AiAssistantRole, 'system'>;
  content: string;
}

export interface AiAssistantCategorySummary {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  parentId?: string | null;
}

export interface AiAssistantProductSummary {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image?: string | null;
  inStock?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  categoryName?: string | null;
  tags?: string[];
}

export interface AiAssistantSuggestions {
  categories: AiAssistantCategorySummary[];
  products: AiAssistantProductSummary[];
}

export interface AiAssistantMessage {
  id: string;
  role: AiAssistantRole;
  content: string;
  createdAt: Date;
  status?: 'pending' | 'ready' | 'error';
  suggestions?: AiAssistantSuggestions;
}

export interface AiAssistantResponse {
  answer: string;
  suggestions: AiAssistantSuggestions;
}
