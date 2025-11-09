import { Favorite } from '../entities/Favorite';

export interface IFavoriteRepository {
  getFavorites(userId?: string): Promise<Favorite[]>;
  addFavorite(productId: string): Promise<Favorite[]>;
  removeFavorite(productId: string): Promise<Favorite[]>;
  toggleFavorite(productId: string): Promise<Favorite[]>;
  isFavorite(productId: string): Promise<boolean>;
}
