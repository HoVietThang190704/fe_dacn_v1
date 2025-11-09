import {
  IProductReviewRepository,
  DeleteProductReviewPayload
} from '../repositories/IProductReviewRepository';
import { ProductReviewSummary } from '../entities/ProductReview';

export class DeleteProductReviewUseCase {
  constructor(private readonly repository: IProductReviewRepository) {}

  async execute(payload: DeleteProductReviewPayload): Promise<ProductReviewSummary> {
    return this.repository.deleteReview(payload);
  }
}
