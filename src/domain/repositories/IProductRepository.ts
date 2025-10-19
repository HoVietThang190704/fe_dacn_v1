import { Product, ProductCategory } from '../entities/Product';

export interface IProductRepository {
  getProducts(params?: GetProductsParams): Promise<ProductsResponse>;
  getProductById(id: string): Promise<Product>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getBestSellingProducts(limit?: number): Promise<Product[]>;
  getNewProducts(limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getCategories(): Promise<ProductCategory[]>;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'price' | 'name' | 'newest';
  order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}
