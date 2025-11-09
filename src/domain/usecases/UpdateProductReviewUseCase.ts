import {
  IProductReviewRepository,
  UpdateProductReviewPayload
} from '../repositories/IProductReviewRepository';
import { ProductReview, ProductReviewSummary } from '../entities/ProductReview';

export interface UpdateProductReviewResponse {
  review: ProductReview;
  summary: ProductReviewSummary;
}

export class UpdateProductReviewUseCase {
  constructor(private readonly repository: IProductReviewRepository) {}

  async execute(payload: UpdateProductReviewPayload): Promise<UpdateProductReviewResponse> {
    return this.repository.updateReview(payload);
  }
}
