import { Favorite } from '../entities/Favorite';

export interface IFavoriteRepository {
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, productId: string): Promise<Favorite>;
  removeFavorite(favoriteId: string): Promise<void>;
  isFavorite(userId: string, productId: string): Promise<boolean>;
}
