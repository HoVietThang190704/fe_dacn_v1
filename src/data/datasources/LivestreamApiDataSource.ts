import { Livestream, LivestreamStatus, CreateLivestreamDto, UpdateLivestreamDto, AgoraToken, LivestreamProductPricing } from '@/domain/entities/Livestream';

export class LivestreamApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log('[LivestreamApiDataSource] Initialized with baseUrl:', baseUrl);
  }

  async getLivestreams(status?: LivestreamStatus): Promise<Livestream[]> {
    const url = status 
      ? `${this.baseUrl}/api/livestreams?status=${status}`
      : `${this.baseUrl}/api/livestreams`;
    
    console.log('[LivestreamApiDataSource] Fetching livestreams from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch livestreams: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data.map(item => this.mapToLivestream(item)) : [];
  }

  async getLivestreamById(id: string): Promise<Livestream> {
    const response = await fetch(`${this.baseUrl}/api/livestreams/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch livestream: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.mapToLivestream(data);
  }

  async getActiveLivestreams(): Promise<Livestream[]> {
    return this.getLivestreams(LivestreamStatus.LIVE);
  }

  async getScheduledLivestreams(): Promise<Livestream[]> {
    return this.getLivestreams(LivestreamStatus.SCHEDULED);
  }

  async getUserHistory(userId: string): Promise<Livestream[]> {
    const response = await fetch(`${this.baseUrl}/api/livestreams/user/${userId}/history`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user history: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data.map(item => this.mapToLivestream(item)) : [];
  }

  async createLivestream(data: CreateLivestreamDto): Promise<Livestream> {
    const url = `${this.baseUrl}/api/livestreams`;
    console.log('[LivestreamApiDataSource] Creating livestream at:', url);
    console.log('[LivestreamApiDataSource] Data:', data);
    const headers = this.buildAuthHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log('[LivestreamApiDataSource] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LivestreamApiDataSource] Error response:', errorText);
      throw new Error(`Failed to create livestream: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('[LivestreamApiDataSource] Created livestream:', result);
    
    // Map MongoDB _id to id
    return this.mapToLivestream(result);
  }

  private mapToLivestream(data: Record<string, unknown>): Livestream {
    const raw = data as unknown as {
      _id?: string;
      id?: string;
      productPricing?: unknown;
    } & Partial<Livestream>;

    return {
      ...raw,
      id: raw._id ?? (raw.id as string),
      productPricing: raw.productPricing as LivestreamProductPricing[] | undefined,
    } as Livestream;
  }

  async updateLivestream(id: string, data: UpdateLivestreamDto): Promise<Livestream> {
    const response = await fetch(`${this.baseUrl}/api/livestreams/${id}`, {
      method: 'PUT',
      headers: this.buildAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update livestream: ${response.statusText}`);
    }
    
    const result = await response.json();
    return this.mapToLivestream(result);
  }

  async updateLivestreamStatus(id: string, status: LivestreamStatus): Promise<Livestream> {
    const response = await fetch(`${this.baseUrl}/api/livestreams/${id}/status`, {
      method: 'PUT',
      headers: this.buildAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update livestream status: ${response.statusText}`);
    }
    
    const result = await response.json();
    return this.mapToLivestream(result);
  }

  async updateLivestreamProducts(id: string, pricing: Livestream['productPricing']): Promise<Livestream> {
    const response = await fetch(`${this.baseUrl}/api/livestreams/${id}`, {
      method: 'PUT',
      headers: this.buildAuthHeaders(),
      body: JSON.stringify({ productPricing: pricing }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update livestream products: ${response.statusText}`);
    }

    const result = await response.json();
    return this.mapToLivestream(result);
  }

  async getAgoraToken(channel: string, uid: number, role: 'publisher' | 'audience'): Promise<AgoraToken> {
    const url = `${this.baseUrl}/api/agora/token?channel=${encodeURIComponent(channel)}&uid=${uid}&role=${role}`;
    console.log('[LivestreamAPI] Getting Agora token from:', url);
    
    const response = await fetch(url);
    
    console.log('[LivestreamAPI] Agora token response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LivestreamAPI] Agora token error:', errorText);
      throw new Error(`Failed to get Agora token: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[LivestreamAPI] Agora token received:', { appId: data.appId, uid: data.uid });
    return data;
  }

  private buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private getAuthToken(): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      undefined
    ) || undefined;
  }
}
