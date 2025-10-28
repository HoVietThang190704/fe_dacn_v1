import { User, UpdateUserDto } from '@/domain/entities/User';

export class UserApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUserProfile(userId: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateUserProfile(userId: string, updates: UpdateUserDto): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }
    
    return await response.json();
  }
}