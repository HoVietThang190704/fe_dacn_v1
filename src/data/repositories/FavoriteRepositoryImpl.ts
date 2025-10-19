import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';
import { Favorite } from '@/domain/entities/Favorite';
import { FavoriteApiDataSource } from '../datasources/FavoriteApiDataSource';

export class FavoriteRepositoryImpl implements IFavoriteRepository {
  constructor(private apiDataSource: FavoriteApiDataSource) {}

  async getFavorites(userId: string): Promise<Favorite[]> {
    return await this.apiDataSource.getFavorites(userId);
  }

  async addFavorite(userId: string, productId: string): Promise<Favorite> {
    return await this.apiDataSource.addFavorite(userId, productId);
  }

  async removeFavorite(favoriteId: string): Promise<void> {
    return await this.apiDataSource.removeFavorite(favoriteId);
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    return await this.apiDataSource.isFavorite(userId, productId);
  }
}
