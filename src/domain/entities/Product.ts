export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  category: ProductCategorySummary;
  owner: ProductOwnerSummary;
  unit: string;
  stock: number;
  stockQuantity?: number;
  description?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  origin?: string;
  additionalImages?: string[];
  inStock?: boolean;
  tags?: string[];
  shelfLife?: number; // in days, optional
  createdAt?: string;
  updatedAt?: string;
  sold?: number;
  isAvailable?: boolean;
  isHighRated?: boolean;
  isPopular?: boolean;
  hasValidPrice?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
  parentId?: string | null;
}

export interface ProductCategorySummary {
  id: string;
  name?: string;
  slug?: string;
}

export interface ProductOwnerSummary {
  id: string;
  email?: string;
  userName?: string;
  role?: string;
  avatar?: string;
}
