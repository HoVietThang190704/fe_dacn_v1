import { PaginatedProductReviews, ProductReview, ProductReviewSummary } from '../entities/ProductReview';

export interface GetProductReviewsParams {
  productId: string;
  page?: number;
  limit?: number;
}

export interface CreateProductReviewPayload {
  productId: string;
  content: string;
  rating?: number;
  parentReviewId?: string;
  images?: string[];
  cloudinaryPublicIds?: string[];
  mentionedUserId?: string;
}

export interface UpdateProductReviewPayload {
  reviewId: string;
  content?: string;
  rating?: number;
  images?: string[];
  cloudinaryPublicIds?: string[];
}

export interface DeleteProductReviewPayload {
  reviewId: string;
}

export interface IProductReviewRepository {
  getProductReviews(params: GetProductReviewsParams): Promise<PaginatedProductReviews>;
  createReview(payload: CreateProductReviewPayload): Promise<{ review: ProductReview; summary: ProductReviewSummary }>;
  updateReview(payload: UpdateProductReviewPayload): Promise<{ review: ProductReview; summary: ProductReviewSummary }>;
  deleteReview(payload: DeleteProductReviewPayload): Promise<ProductReviewSummary>;
}
