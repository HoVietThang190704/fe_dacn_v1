import {
  IProductRepository,
  GetProductsParams,
  ProductsResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from '@/domain/repositories/IProductRepository';
import { Product, ProductCategory } from '@/domain/entities/Product';
import { ProductApiDataSource } from '../datasources/ProductApiDataSource';

export class ProductRepositoryImpl implements IProductRepository {
  constructor(private apiDataSource: ProductApiDataSource) {}

  async getProducts(params?: GetProductsParams): Promise<ProductsResponse> {
    return await this.apiDataSource.getProducts(params);
  }

  async getProductById(id: string): Promise<Product> {
    return await this.apiDataSource.getProductById(id);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await this.apiDataSource.getProductsByCategory(categoryId);
  }

  async getBestSellingProducts(limit?: number): Promise<Product[]> {
    return await this.apiDataSource.getBestSellingProducts(limit);
  }

  async getNewProducts(limit?: number): Promise<Product[]> {
    return await this.apiDataSource.getNewProducts(limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await this.apiDataSource.searchProducts(query);
  }

  async getCategories(): Promise<ProductCategory[]> {
    return await this.apiDataSource.getCategories();
  }

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    return await this.apiDataSource.createProduct(payload);
  }

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    return await this.apiDataSource.updateProduct(id, payload);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.apiDataSource.deleteProduct(id);
  }
}
