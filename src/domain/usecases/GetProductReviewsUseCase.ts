import { IProductReviewRepository, GetProductReviewsParams } from '../repositories/IProductReviewRepository';
import { PaginatedProductReviews } from '../entities/ProductReview';

export class GetProductReviewsUseCase {
  constructor(private readonly repository: IProductReviewRepository) {}

  async execute(params: GetProductReviewsParams): Promise<PaginatedProductReviews> {
    return this.repository.getProductReviews(params);
  }
}
