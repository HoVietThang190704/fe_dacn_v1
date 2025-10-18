/**
 * Domain Entity: Favorite
 * Pure business logic, no framework dependencies
 */
import { Product } from './Product';

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: Date;
}
