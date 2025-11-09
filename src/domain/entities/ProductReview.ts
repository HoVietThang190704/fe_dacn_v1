export interface ProductReviewUser {
  id: string;
  userName?: string;
  email: string;
  avatar?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  user?: ProductReviewUser;
  rating?: number;
  content: string;
  images: string[];
  parentReviewId?: string;
  level: number;
  mentionedUserId?: string;
  mentionedUser?: ProductReviewUser;
  replies?: ProductReview[];
  repliesCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewSummary {
  average: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

export interface PaginatedProductReviews {
  reviews: ProductReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: ProductReviewSummary;
}
