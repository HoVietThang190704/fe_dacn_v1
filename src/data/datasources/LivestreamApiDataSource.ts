import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';

export class LivestreamApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getLivestreams(status?: LivestreamStatus): Promise<Livestream[]> {
    const url = status 
      ? `${this.baseUrl}/livestreams?status=${status}`
      : `${this.baseUrl}/livestreams`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch livestreams: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getLivestreamById(id: string): Promise<Livestream> {
    const response = await fetch(`${this.baseUrl}/livestreams/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch livestream: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getActiveLivestreams(): Promise<Livestream[]> {
    const response = await fetch(`${this.baseUrl}/livestreams/active`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch active livestreams: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getScheduledLivestreams(): Promise<Livestream[]> {
    const response = await fetch(`${this.baseUrl}/livestreams/scheduled`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scheduled livestreams: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
