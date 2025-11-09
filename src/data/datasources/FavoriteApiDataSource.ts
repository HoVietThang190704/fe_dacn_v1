import { Favorite, FavoriteProduct } from '@/domain/entities/Favorite';
import { authApiClient } from '@/lib/authApiClient';
import { API_ENDPOINTS } from '@/shared/constants/api';

type WishlistProductDto = {
  id?: string;
  _id?: string;
  name?: string;
  price?: number;
  image?: string;
  images?: string[];
  unit?: string;
  stock?: number;
  stockQuantity?: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
};

type WishlistItemDto = {
  id?: string;
  _id?: string;
  productId: string | WishlistProductDto;
  // backend may return an attached product snapshot under `product`
  product?: string | WishlistProductDto;
  addedAt?: string;
  note?: string;
};

type WishlistDto = {
  id: string;
  userId: string;
  items?: WishlistItemDto[];
  createdAt: string;
  updatedAt: string;
};

type WishlistApiResponse = {
  success?: boolean;
  data?: WishlistDto;
  message?: string;
};

export class FavoriteApiDataSource {
  private mapProduct(raw: WishlistProductDto | string): FavoriteProduct | undefined {
    if (!raw) {
      return undefined;
    }

    if (typeof raw === 'string') {
      return { id: raw };
    }

    const id = raw.id || raw._id;
    const images = Array.isArray(raw.images)
      ? raw.images.filter((img): img is string => typeof img === 'string' && img.length > 0)
      : [];

    const image = typeof raw.image === 'string' && raw.image.length > 0 ? raw.image : images[0];

    return {
      id: id || '',
      name: raw.name,
      price: raw.price,
      image,
      images,
      unit: raw.unit,
      stock: typeof raw.stock === 'number' ? raw.stock : raw.stockQuantity,
      stockQuantity: raw.stockQuantity,
      inStock: raw.inStock,
      rating: raw.rating,
      reviewCount: raw.reviewCount,
      originalPrice: raw.originalPrice,
      discount: raw.discount,
    };
  }

  private mapFavorites(items: WishlistItemDto[] | undefined, wishlistUserId?: string): Favorite[] {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const normalized: Favorite[] = [];

    items.forEach((item) => {
      // Prefer explicit attached product snapshot (item.product) from backend; fall back to item.productId
  const rawProduct = item.product ?? item.productId;

      // normalize product id as a string
      let productIdStr = '';
      if (typeof item.productId === 'string') {
        productIdStr = item.productId;
      } else if (rawProduct && typeof rawProduct === 'object') {
        productIdStr = (rawProduct.id as string) || (rawProduct._id as string) || '';
      } else if (item.productId) {
        productIdStr = String(item.productId);
      }

      if (!productIdStr) return;

      normalized.push({
        id: item.id || item._id || productIdStr,
        userId: wishlistUserId || '',
        productId: productIdStr,
        addedAt: item.addedAt,
        note: item.note,
        product: this.mapProduct(rawProduct as WishlistProductDto | string),
      });
    });

    return normalized;
  }

  private extractFavorites(response: WishlistApiResponse | undefined, fallbackError: string): Favorite[] {
    if (!response?.success) {
      throw new Error(response?.message || fallbackError);
    }

    return this.mapFavorites(response.data?.items, response.data?.userId);
  }

  async getFavorites(): Promise<Favorite[]> {
    const response = await authApiClient.get<WishlistApiResponse>(API_ENDPOINTS.WISHLIST);
    if (!response.success) {
      throw new Error(response.error || 'Không thể tải danh sách yêu thích');
    }

    return this.extractFavorites(response.data, 'Không thể tải danh sách yêu thích');
  }

  async addFavorite(productId: string, note?: string): Promise<Favorite[]> {
    const response = await authApiClient.post<WishlistApiResponse>(API_ENDPOINTS.WISHLIST, {
      productId,
      note,
    });

    if (!response.success) {
      throw new Error(response.error || 'Không thể thêm sản phẩm vào yêu thích');
    }

    return this.extractFavorites(response.data, 'Không thể thêm sản phẩm vào yêu thích');
  }

  async removeFavorite(productId: string): Promise<Favorite[]> {
    const response = await authApiClient.delete<WishlistApiResponse>(API_ENDPOINTS.WISHLIST_ITEM(productId));

    if (!response.success) {
      throw new Error(response.error || 'Không thể xóa sản phẩm khỏi yêu thích');
    }

    return this.extractFavorites(response.data, 'Không thể xóa sản phẩm khỏi yêu thích');
  }

  async toggleFavorite(productId: string): Promise<Favorite[]> {
    const response = await authApiClient.post<WishlistApiResponse>(API_ENDPOINTS.WISHLIST_TOGGLE(productId), {});

    if (!response.success) {
      throw new Error(response.error || 'Không thể cập nhật danh sách yêu thích');
    }

    return this.extractFavorites(response.data, 'Không thể cập nhật danh sách yêu thích');
  }

  async isFavorite(productId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some((fav) => fav.productId === productId);
  }
}
