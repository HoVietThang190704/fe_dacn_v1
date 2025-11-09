import { IProductRepository, UpdateProductPayload } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';

export class UpdateProductUseCase {
  constructor(private repository: IProductRepository) {}

  async execute(id: string, payload: UpdateProductPayload): Promise<Product> {
    return this.repository.updateProduct(id, payload);
  }
}
