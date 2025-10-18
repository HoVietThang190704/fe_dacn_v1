/**
 * Domain Entity: Product
 * Pure business logic, no framework dependencies
 */
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
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  slug: string;
}
