import { Product, ProductCategory } from '../entities/Product';

export interface IProductRepository {
  getProducts(params?: GetProductsParams): Promise<ProductsResponse>;
  getProductById(id: string): Promise<Product>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getBestSellingProducts(limit?: number): Promise<Product[]>;
  getNewProducts(limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getCategories(): Promise<ProductCategory[]>;
  createProduct(payload: CreateProductPayload): Promise<Product>;
  updateProduct(id: string, payload: UpdateProductPayload): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  order?: 'asc' | 'desc';
  search?: string;
  inStock?: boolean;
  owner?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit?: number;
}

export interface CreateProductPayload {
  name: string;
  nameEn?: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  images?: string[];
  stockQuantity: number;
  tags?: string[];
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, 'stockQuantity'>> & {
  stockQuantity?: number;
  inStock?: boolean;
};
