/**
 * Data Source: Product API
 * Handles HTTP requests to product endpoints
 */
import { Product, ProductCategory } from '@/domain/entities/Product';
import { GetProductsParams, ProductsResponse } from '@/domain/repositories/IProductRepository';

export class ProductApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getProducts(params?: GetProductsParams): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const response = await fetch(`${this.baseUrl}/products?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products?category=${categoryId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products by category: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products || [];
  }

  async getBestSellingProducts(limit: number = 10): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/best-selling?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch best selling products: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getNewProducts(limit: number = 10): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/new?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch new products: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getCategories(): Promise<ProductCategory[]> {
    const response = await fetch(`${this.baseUrl}/categories`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
