import { IProductRepository, GetProductsParams, ProductsResponse } from '../repositories/IProductRepository';

export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(params?: GetProductsParams): Promise<ProductsResponse> {
    return await this.productRepository.getProducts(params);
  }
}
