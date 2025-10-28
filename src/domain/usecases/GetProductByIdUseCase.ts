import { IProductRepository } from '../repositories/IProductRepository';
import { Product } from '../entities/Product';

export class GetProductByIdUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string): Promise<Product> {
    return await this.productRepository.getProductById(id);
  }
}