/**
 * Data Source: Favorite API
 * Handles HTTP requests to favorite endpoints
 */
import { Favorite } from '@/domain/entities/Favorite';

export class FavoriteApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const response = await fetch(`${this.baseUrl}/favorites?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async addFavorite(userId: string, productId: string): Promise<Favorite> {
    const response = await fetch(`${this.baseUrl}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, productId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add favorite: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async removeFavorite(favoriteId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove favorite: ${response.statusText}`);
    }
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/favorites/check?userId=${userId}&productId=${productId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check favorite: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.isFavorite;
  }
}
