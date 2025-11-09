import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';
import { Favorite } from '@/domain/entities/Favorite';
import { FavoriteApiDataSource } from '../datasources/FavoriteApiDataSource';

export class FavoriteRepositoryImpl implements IFavoriteRepository {
  constructor(private readonly apiDataSource: FavoriteApiDataSource) {}

  async getFavorites(userId?: string): Promise<Favorite[]> {
    void userId;
    return await this.apiDataSource.getFavorites();
  }

  async addFavorite(productId: string): Promise<Favorite[]> {
    return await this.apiDataSource.addFavorite(productId);
  }

  async removeFavorite(productId: string): Promise<Favorite[]> {
    return await this.apiDataSource.removeFavorite(productId);
  }

  async toggleFavorite(productId: string): Promise<Favorite[]> {
    return await this.apiDataSource.toggleFavorite(productId);
  }

  async isFavorite(productId: string): Promise<boolean> {
    return await this.apiDataSource.isFavorite(productId);
  }
}
