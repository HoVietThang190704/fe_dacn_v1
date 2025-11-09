import {
  IProductReviewRepository,
  GetProductReviewsParams,
  CreateProductReviewPayload,
  UpdateProductReviewPayload,
  DeleteProductReviewPayload
} from '@/domain/repositories/IProductReviewRepository';
import {
  PaginatedProductReviews,
  ProductReview,
  ProductReviewSummary
} from '@/domain/entities/ProductReview';
import { ProductReviewApiDataSource } from '../datasources/ProductReviewApiDataSource';

export class ProductReviewRepositoryImpl implements IProductReviewRepository {
  constructor(private readonly dataSource: ProductReviewApiDataSource) {}

  async getProductReviews(params: GetProductReviewsParams): Promise<PaginatedProductReviews> {
    return this.dataSource.getReviews(params);
  }

  async createReview(payload: CreateProductReviewPayload): Promise<{ review: ProductReview; summary: ProductReviewSummary }> {
    return this.dataSource.createReview(payload);
  }

  async updateReview(payload: UpdateProductReviewPayload): Promise<{ review: ProductReview; summary: ProductReviewSummary }> {
    return this.dataSource.updateReview(payload);
  }

  async deleteReview(payload: DeleteProductReviewPayload): Promise<ProductReviewSummary> {
    return this.dataSource.deleteReview(payload.reviewId);
  }
}
