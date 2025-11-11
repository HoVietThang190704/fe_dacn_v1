import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';
import { ProductDto } from './ProductApiDataSource';

export type PostAuthorDto = {
  id: string;
  userName?: string;
  email: string;
  avatar?: string;
};

export type PostDto = {
  id: string;
  userId: string;
  user?: PostAuthorDto;
  content?: string;
  images?: string[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLiked?: boolean;
  visibility?: 'public' | 'friends' | 'private';
  isEdited?: boolean;
  editedAt?: string;
  originalPostId?: string;
  originalPost?: PostDto;
  sharedBy?: PostAuthorDto;
  createdAt?: string;
  updatedAt?: string;
};

export type UserDto = {
  id: string;
  email: string;
  userName?: string;
  phone?: string;
  avatar?: string;
  address?: Record<string, unknown> | null;
  role?: string;
  isVerified?: boolean;
  dateOfBirth?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SearchApiSection<T> = {
  items?: T[];
  total?: number;
  limit?: number;
  hasMore?: boolean;
  page?: number;
  totalPages?: number;
};

export type SearchApiResponse = {
  query: string;
  products: SearchApiSection<ProductDto>;
  posts: SearchApiSection<PostDto>;
  users: SearchApiSection<UserDto>;
};

export class SearchApiDataSource {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    if (baseUrl === undefined || baseUrl === null) {
      throw new Error('SearchApiDataSource requires a baseUrl value');
    }
    this.baseUrl = baseUrl;
  }

  async search(query: string, options?: {
    productsLimit?: number;
    postsLimit?: number;
    usersLimit?: number;
  }): Promise<SearchApiResponse> {
    const keyword = (query ?? '').trim();
    if (!keyword) {
      throw new Error('Keyword is required');
    }

    const params = new URLSearchParams({ q: keyword });
    if (options?.productsLimit) params.set('productsLimit', String(options.productsLimit));
    if (options?.postsLimit) params.set('postsLimit', String(options.postsLimit));
    if (options?.usersLimit) params.set('usersLimit', String(options.usersLimit));

  const prefix = this.baseUrl ? `${this.baseUrl}${API_ENDPOINTS.GLOBAL_SEARCH}` : API_ENDPOINTS.GLOBAL_SEARCH;
  const url = `${prefix}?${params.toString()}`;
    const response = await fetch(url, { credentials: 'include' });

    if (!response.ok) {
      const message = `${response.status} ${response.statusText}`;
      throw new Error(message || 'Failed to fetch search results');
    }

    const payload = await response.json() as { success?: boolean; data?: SearchApiResponse; message?: string };
    if (payload.success === false) {
      throw new Error(payload.message || 'Search request failed');
    }

    if (!payload.data) {
      throw new Error('Search response missing data');
    }

    return payload.data;
  }
}
