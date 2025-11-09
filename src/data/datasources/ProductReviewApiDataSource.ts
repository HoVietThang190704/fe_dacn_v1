import {
  CreateProductReviewPayload,
  GetProductReviewsParams,
  UpdateProductReviewPayload
} from '@/domain/repositories/IProductReviewRepository';
import {
  PaginatedProductReviews,
  ProductReview,
  ProductReviewSummary
} from '@/domain/entities/ProductReview';
import { API_ENDPOINTS } from '@/shared/constants/api';

interface ProductReviewResponse {
  success?: boolean;
  data?: {
    review?: ProductReviewDTO;
    summary?: ProductReviewSummaryDTO;
  };
  message?: string;
}

interface ProductReviewSummaryDTO {
  average: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

interface ProductReviewDTO {
  id: string;
  productId: string;
  userId: string;
  user?: {
    id: string;
    userName?: string;
    email: string;
    avatar?: string;
  };
  rating?: number;
  content: string;
  images?: string[];
  parentReviewId?: string;
  level: number;
  mentionedUserId?: string;
  mentionedUser?: {
    id: string;
    userName?: string;
    email: string;
    avatar?: string;
  };
  replies?: ProductReviewDTO[];
  repliesCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedProductReviewsResponse {
  success?: boolean;
  data?: {
    reviews?: ProductReviewDTO[];
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      hasMore?: boolean;
    };
    summary?: ProductReviewSummaryDTO;
  };
  message?: string;
}

export class ProductReviewApiDataSource {
  constructor(private readonly baseUrl: string) {
    if (!baseUrl) {
      throw new Error('ProductReviewApiDataSource requires baseUrl');
    }
  }

  async getReviews(params: GetProductReviewsParams): Promise<PaginatedProductReviews> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const endpoint = `${API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT(params.productId)}${query.toString() ? `?${query.toString()}` : ''}`;
    const payload = await this.request<PaginatedProductReviewsResponse>(endpoint, { method: 'GET' });

    const reviews = this.mapReviews(payload.data?.reviews ?? []);
    const summary = this.mapSummary(payload.data?.summary);

    return {
      reviews,
      pagination: {
        total: payload.data?.pagination?.total ?? reviews.length,
        page: payload.data?.pagination?.page ?? params.page ?? 1,
        limit: payload.data?.pagination?.limit ?? params.limit ?? reviews.length,
        totalPages: payload.data?.pagination?.totalPages ?? 1,
        hasMore: payload.data?.pagination?.hasMore ?? false
      },
      summary
    };
  }

  async createReview(payload: CreateProductReviewPayload): Promise<{ review: ProductReview; summary: ProductReviewSummary }> {
    const response = await this.request<ProductReviewResponse>(API_ENDPOINTS.PRODUCT_REVIEWS, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);

    const review = this.mapReview(response.data?.review);
    const summary = this.mapSummary(response.data?.summary);

    if (!review) {
      throw new Error(response.message || 'Không thể tạo đánh giá');
    }

    return { review, summary };
  }

  async updateReview(payload: UpdateProductReviewPayload): Promise<{ review: ProductReview; summary: ProductReviewSummary }> {
    const endpoint = API_ENDPOINTS.PRODUCT_REVIEW_DETAIL(payload.reviewId);
    const response = await this.request<ProductReviewResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        content: payload.content,
        rating: payload.rating,
        images: payload.images,
        cloudinaryPublicIds: payload.cloudinaryPublicIds
      })
    }, true);

    const review = this.mapReview(response.data?.review);
    const summary = this.mapSummary(response.data?.summary);

    if (!review) {
      throw new Error(response.message || 'Không thể cập nhật đánh giá');
    }

    return { review, summary };
  }

  async deleteReview(reviewId: string): Promise<ProductReviewSummary> {
    const endpoint = API_ENDPOINTS.PRODUCT_REVIEW_DETAIL(reviewId);
    const response = await this.request<ProductReviewResponse>(endpoint, {
      method: 'DELETE'
    }, true);

    return this.mapSummary(response.data?.summary);
  }

  private mapReview(dto?: ProductReviewDTO): ProductReview | undefined {
    if (!dto) return undefined;

    return {
      id: dto.id,
      productId: dto.productId,
      userId: dto.userId,
      user: dto.user,
      rating: dto.rating,
      content: dto.content,
      images: dto.images ?? [],
      parentReviewId: dto.parentReviewId,
      level: dto.level,
      mentionedUserId: dto.mentionedUserId,
      mentionedUser: dto.mentionedUser,
      replies: dto.replies ? this.mapReviews(dto.replies) : undefined,
      repliesCount: dto.repliesCount ?? dto.replies?.length ?? 0,
      isEdited: dto.isEdited,
      editedAt: dto.editedAt,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private mapReviews(dtos: ProductReviewDTO[]): ProductReview[] {
    return dtos
      .map((dto) => this.mapReview(dto))
      .filter((item): item is ProductReview => Boolean(item));
  }

  private mapSummary(summary?: ProductReviewSummaryDTO): ProductReviewSummary {
    return {
      average: summary?.average ?? 0,
      totalReviews: summary?.totalReviews ?? 0,
      distribution: summary?.distribution ?? {}
    };
  }

  private async request<T>(path: string, options: RequestInit, requireAuth = false): Promise<T> {
    const url = this.buildUrl(path);
    const headers: Record<string, string> = {};

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (!(options.body instanceof FormData) && options.method && options.method !== 'GET') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (requireAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers
    });

    const text = await response.text();
    let data: unknown = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
    }

    const payload = (data || {}) as T & { success?: boolean; message?: string };

    if (!response.ok || payload.success === false) {
      const message = payload.message || response.statusText;
      throw new Error(message || 'Request failed');
    }

    return payload as T;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private getToken(): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      undefined
    ) || undefined;
  }
}
