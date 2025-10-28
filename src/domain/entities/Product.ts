export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  unit: string;
  stock: number;
  description?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  origin?: string;
  additionalImages?: string[];
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  slug: string;
}
