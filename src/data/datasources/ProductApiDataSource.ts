import { Product, ProductCategory } from '@/domain/entities/Product';
import { API_ENDPOINTS } from '@/shared/constants/api';
import {
  CreateProductPayload,
  GetProductsParams,
  ProductsResponse,
  UpdateProductPayload,
} from '@/domain/repositories/IProductRepository';

export const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/400?text=No+Image';

export type ProductCategoryDto = {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
};

export type ProductOwnerDto = {
  id?: string;
  _id?: string;
  email?: string;
  userName?: string;
  role?: string;
  avatar?: string;
};

export type ProductDto = {
  id: string;
  name: string;
  nameEn?: string;
  category: ProductCategoryDto | string;
  owner?: ProductOwnerDto | string;
  price: number;
  unit: string;
  description?: string;
  images?: string[];
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  isAvailable?: boolean;
  isHighRated?: boolean;
  isPopular?: boolean;
  hasValidPrice?: boolean;
};

type PaginatedProductResponse = {
  success?: boolean;
  data?: ProductDto[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type ProductResponse = {
  success?: boolean;
  data?: ProductDto;
  message?: string;
};

type CategoryDto = {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  icon?: string;
  parentId?: string | null;
  children?: CategoryDto[];
};

export const mapProductDtoToDomain = (dto: ProductDto): Product => {
  const images = Array.isArray(dto.images) ? dto.images.filter(Boolean) : [];
  const image = images[0] || DEFAULT_PRODUCT_IMAGE;
  const rawCategory = dto.category as ProductCategoryDto | string | undefined;
  const category = rawCategory && typeof rawCategory === 'object'
    ? {
        id: rawCategory.id ?? rawCategory._id ?? '',
        name: rawCategory.name,
        slug: rawCategory.slug,
      }
    : {
        id: typeof rawCategory === 'string' ? rawCategory : '',
      };

  const rawOwner = dto.owner as ProductOwnerDto | string | undefined;
  const owner = rawOwner && typeof rawOwner === 'object'
    ? {
        id: rawOwner.id ?? rawOwner._id ?? '',
        email: rawOwner.email,
        userName: rawOwner.userName,
        role: rawOwner.role,
        avatar: rawOwner.avatar,
      }
    : {
        id: typeof rawOwner === 'string' ? rawOwner : '',
      };

  const stockQuantity = dto.stockQuantity ?? 0;
  const tags = Array.isArray(dto.tags) ? dto.tags.filter(Boolean) : [];

  return {
    id: dto.id,
    name: dto.name,
    nameEn: dto.nameEn,
    price: dto.price,
    originalPrice: undefined,
    discount: undefined,
    image,
    images,
    category,
    owner,
    unit: dto.unit,
    stock: stockQuantity,
    stockQuantity,
    description: dto.description,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    additionalImages: images.slice(1),
    inStock: dto.inStock,
    tags,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    sold: dto.reviewCount,
    isAvailable: dto.isAvailable,
    isHighRated: dto.isHighRated,
    isPopular: dto.isPopular,
    hasValidPrice: dto.hasValidPrice,
    isBestSeller: (dto.reviewCount ?? 0) > 100,
    isNew: (() => {
      if (!dto.createdAt) return false;
      const date = new Date(dto.createdAt);
      if (Number.isNaN(date.getTime())) return false;
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      return Date.now() - date.getTime() <= THIRTY_DAYS;
    })()
  };
};

export class ProductApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl) {
      throw new Error('ProductApiDataSource requires a valid baseUrl');
    }
    this.baseUrl = baseUrl;
  }

  async getProducts(params?: GetProductsParams): Promise<ProductsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.category) query.append('category', params.category);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.order) query.append('order', params.order);
    if (params?.search) query.append('q', params.search);
    if (typeof params?.inStock === 'boolean') query.append('inStock', String(params.inStock));
    if (typeof params?.minPrice === 'number') query.append('minPrice', params.minPrice.toString());
    if (typeof params?.maxPrice === 'number') query.append('maxPrice', params.maxPrice.toString());
    if (typeof params?.minRating === 'number') query.append('minRating', params.minRating.toString());
    if (params?.owner) query.append('owner', params.owner);
    if (Array.isArray(params?.tags) && params.tags.length > 0) {
      query.append('tags', params.tags.join(','));
    }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const endpoint = `${API_ENDPOINTS.PRODUCTS}${suffix}`;
  const payload = await this.request<PaginatedProductResponse>(endpoint, { method: 'GET' });

  const products = Array.isArray(payload.data) ? payload.data.map((item) => mapProductDtoToDomain(item)) : [];
    const pagination = payload.pagination || {};

    return {
      products,
      total: pagination.total ?? products.length,
      page: pagination.page ?? params?.page ?? 1,
      totalPages: pagination.totalPages ?? 1,
      limit: pagination.limit ?? params?.limit,
    };
  }

  async getProductById(id: string): Promise<Product> {
  const payload = await this.request<ProductResponse>(`${API_ENDPOINTS.PRODUCTS}/${id}`, { method: 'GET' });
    if (!payload.data) {
      throw new Error(payload.message || 'Product data not available');
    }
  return mapProductDtoToDomain(payload.data);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await this.getProducts({ category: categoryId });
    return response.products;
  }

  async getBestSellingProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.getProducts({ sortBy: 'rating', order: 'desc', limit });
    return response.products.slice(0, limit);
  }

  async getNewProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.getProducts({ sortBy: 'createdAt', order: 'desc', limit });
    return response.products.slice(0, limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.getProducts({ search: query });
    return response.products;
  }

  async getCategories(): Promise<ProductCategory[]> {
    const payload = await this.request<{ success?: boolean; data?: CategoryDto[]; message?: string }>(
      `${API_ENDPOINTS.PRODUCT_CATEGORIES}?includeInactive=false`,
      { method: 'GET' }
    );

    // Debug: log raw categories payload to help diagnose empty results
    try {
      console.debug('[ProductApiDataSource] getCategories payload:', payload);
    } catch {}

    if (!payload.data || !Array.isArray(payload.data)) {
      return [];
    }

    const flattened = this.flattenCategories(payload.data);
    try {
      console.debug('[ProductApiDataSource] flattened categories count:', flattened.length, flattened.slice(0, 6));
    } catch {}
    return flattened;
  }

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const normalized = this.normalizeCreatePayload(payload);
    const response = await this.request<ProductResponse>(
      API_ENDPOINTS.PRODUCTS,
      {
        method: 'POST',
        body: JSON.stringify(normalized),
      },
      true
    );

    if (!response.data) {
      throw new Error(response.message || 'Không thể tạo sản phẩm');
    }

  return mapProductDtoToDomain(response.data);
  }

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    const normalized = this.normalizeUpdatePayload(payload);
    const response = await this.request<ProductResponse>(
      `${API_ENDPOINTS.PRODUCTS}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(normalized),
      },
      true
    );

    if (!response.data) {
      throw new Error(response.message || 'Không thể cập nhật sản phẩm');
    }

  return mapProductDtoToDomain(response.data);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`${API_ENDPOINTS.PRODUCTS}/${id}`,
      {
        method: 'DELETE',
      },
      true
    );
  }

  private flattenCategories(categories: CategoryDto[], parentId?: string | null): ProductCategory[] {
    const result: ProductCategory[] = [];
    categories.forEach((category) => {
      if (!category) return;
      const id = (category.id || category._id || '').toString();
      if (!id) return;

      result.push({
        id,
        name: category.name ?? 'Unnamed category',
        icon: category.icon,
        slug: category.slug,
        parentId: category.parentId ?? parentId ?? null,
      });

      if (Array.isArray(category.children) && category.children.length > 0) {
        result.push(...this.flattenCategories(category.children, id));
      }
    });
    return result;
  }

  private normalizeCreatePayload(payload: CreateProductPayload): Record<string, unknown> {
    const stockQuantity = Number(payload.stockQuantity);
    const normalizedTags = (payload.tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    return {
      name: payload.name.trim(),
      nameEn: payload.nameEn?.trim() || undefined,
      category: payload.category,
      price: Number(payload.price),
      unit: payload.unit.trim(),
      description: payload.description.trim(),
      images: (payload.images ?? []).map((url) => url.trim()).filter(Boolean),
      stockQuantity,
      inStock: stockQuantity > 0,
      tags: normalizedTags,
    };
  }

  private normalizeUpdatePayload(payload: UpdateProductPayload): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (payload.name !== undefined) data.name = payload.name.trim();
    if (payload.nameEn !== undefined) data.nameEn = payload.nameEn?.trim() || '';
    if (payload.category !== undefined) data.category = payload.category;
    if (payload.price !== undefined) data.price = Number(payload.price);
    if (payload.unit !== undefined) data.unit = payload.unit.trim();
    if (payload.description !== undefined) data.description = payload.description.trim();
    if (payload.images !== undefined) {
      data.images = payload.images.map((url) => url.trim()).filter(Boolean);
    }
    if (payload.stockQuantity !== undefined) {
      const quantity = Number(payload.stockQuantity);
      data.stockQuantity = quantity;
      data.inStock = quantity > 0;
    }
    if (payload.inStock !== undefined) {
      data.inStock = payload.inStock;
    }
    if (payload.tags !== undefined) {
      data.tags = payload.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    }

    return data;
  }

  private async request<T>(path: string, options: RequestInit, requireAuth = false): Promise<T> {
    const url = this.buildUrl(path);
    const headers: Record<string, string> = {};

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (!(options.body instanceof FormData) && options.method && options.method !== 'GET') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
    // Try to parse JSON; if parsing fails, keep raw text for diagnostics
    let payload: unknown;
    let rawText: string | undefined;
    try {
      const text = await response.text();
      rawText = text;
      try {
        payload = text ? JSON.parse(text) : undefined;
      } catch {
        payload = undefined;
      }
    } catch {
      payload = undefined;
    }

    if (!response.ok) {
      // prefer structured message, then raw text, then statusText
      const messageFromPayload = typeof payload === 'object' && payload && 'message' in payload
        ? ((payload as { message?: string }).message)
        : undefined;
      const message = messageFromPayload || rawText || response.statusText || `HTTP ${response.status}`;
      throw new Error(message || 'Request failed');
    }

    // If API returned success = false, bubble the message too
    if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: unknown }).success === false) {
      const message = (payload as { message?: string }).message || rawText || 'Request failed';
      throw new Error(message);
    }

    return payload as T;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private getAuthToken(): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      undefined
    ) || undefined;
  }
}
