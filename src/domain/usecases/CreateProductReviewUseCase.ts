import {
  IProductReviewRepository,
  CreateProductReviewPayload
} from '../repositories/IProductReviewRepository';
import { ProductReview, ProductReviewSummary } from '../entities/ProductReview';

export interface CreateProductReviewResponse {
  review: ProductReview;
  summary: ProductReviewSummary;
}

export class CreateProductReviewUseCase {
  constructor(private readonly repository: IProductReviewRepository) {}

  async execute(payload: CreateProductReviewPayload): Promise<CreateProductReviewResponse> {
    return this.repository.createReview(payload);
  }
}
