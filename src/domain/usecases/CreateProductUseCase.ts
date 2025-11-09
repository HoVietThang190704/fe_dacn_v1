import { IProductRepository, CreateProductPayload } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';

export class CreateProductUseCase {
  constructor(private repository: IProductRepository) {}

  async execute(payload: CreateProductPayload): Promise<Product> {
    return this.repository.createProduct(payload);
  }
}
