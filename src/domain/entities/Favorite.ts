export interface FavoriteProduct {
  id: string;
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
  owner?: {
    id: string;
    userName?: string;
    email?: string;
  };
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  addedAt?: string;
  note?: string;
  product?: FavoriteProduct;
}
