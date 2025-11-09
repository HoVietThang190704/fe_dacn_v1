import { IProductRepository } from '@/domain/repositories/IProductRepository';

export class DeleteProductUseCase {
  constructor(private repository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.deleteProduct(id);
  }
}
