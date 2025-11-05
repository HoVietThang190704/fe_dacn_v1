import { Post, CreatePostData, UpdatePostData, SharePostData, PaginatedPosts } from '@/domain/entities/Post';
import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';

export class PostApiDataSource {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token || null;
    console.log('[PostApiDataSource] Token set:', this.token ? 'Yes (length: ' + this.token.length + ')' : 'No');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    // If token wasn't explicitly set, attempt to read from localStorage as a fallback
    const tokenToUse = this.token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    if (tokenToUse) {
      headers['Authorization'] = `Bearer ${tokenToUse}`;
    }
    
    return headers;
  }

  private getFullUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  async getFeed(page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    const url = this.getFullUrl(`${API_ENDPOINTS.POSTS_FEED_USER}?page=${page}&limit=${limit}`);
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformResponse(result.data);
  }

  async getPostsByUserId(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    const url = this.getFullUrl(`${API_ENDPOINTS.POSTS_USER(userId)}?page=${page}&limit=${limit}`);
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user posts: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformResponse(result.data);
  }

  async getPublicPosts(page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    const url = this.getFullUrl(`${API_ENDPOINTS.POSTS_FEED_PUBLIC}?page=${page}&limit=${limit}`);
    console.log('[PostApiDataSource] Fetching from:', url);
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    console.log('[PostApiDataSource] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PostApiDataSource] Error response:', errorText);
      throw new Error(`Failed to fetch public posts: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[PostApiDataSource] API Response:', JSON.stringify(result, null, 2));
    
    // Backend returns { success: true, data: { posts: [], pagination: {} } }
    return this.transformResponse(result.data);
  }

  async getPostById(postId: string): Promise<Post> {
    const url = this.getFullUrl(API_ENDPOINTS.POST_DETAIL(postId));
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformPost(result.data);
  }

  async searchPosts(query: string, page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    const url = this.getFullUrl(`${API_ENDPOINTS.POSTS_SEARCH}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformResponse(result.data);
  }

  async getTrendingPosts(limit: number = 10, timeWindow: number = 24): Promise<Post[]> {
    const url = this.getFullUrl(`${API_ENDPOINTS.POSTS_TRENDING}?limit=${limit}&timeWindow=${timeWindow}`);
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trending posts: ${response.statusText}`);
    }

    const result = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.data.map((post: any) => this.transformPost(post));
  }

  async createPost(data: CreatePostData): Promise<Post> {
    // First upload images if any
    let imageUrls: string[] = [];
    let cloudinaryPublicIds: string[] = [];

    if (data.images && data.images.length > 0) {
      const uploadResult = await this.uploadImages(data.images);
      imageUrls = uploadResult.urls;
      cloudinaryPublicIds = uploadResult.publicIds;
    }

    const url = this.getFullUrl(API_ENDPOINTS.CREATE_POST);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content: data.content,
        images: imageUrls,
        cloudinaryPublicIds,
        visibility: data.visibility || 'public',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    const result = await response.json();
    return this.transformPost(result.data);
  }

  async updatePost(data: UpdatePostData): Promise<Post> {
    // Upload new images if any
    let imageUrls: string[] | undefined;
    let cloudinaryPublicIds: string[] | undefined;

    if (data.images && data.images.length > 0) {
      const uploadResult = await this.uploadImages(data.images);
      imageUrls = uploadResult.urls;
      cloudinaryPublicIds = uploadResult.publicIds;
    }

    const url = this.getFullUrl(API_ENDPOINTS.UPDATE_POST(data.postId));
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content: data.content,
        images: imageUrls,
        cloudinaryPublicIds,
        visibility: data.visibility,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update post');
    }

    const result = await response.json();
    return this.transformPost(result.data);
  }

  async deletePost(postId: string): Promise<void> {
    const url = this.getFullUrl(API_ENDPOINTS.DELETE_POST(postId));
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }
  }

  async toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    const url = this.getFullUrl(API_ENDPOINTS.TOGGLE_LIKE_POST(postId));
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle like');
    }

    const result = await response.json();
    return result.data;
  }

  async sharePost(data: SharePostData): Promise<Post> {
    const url = this.getFullUrl(API_ENDPOINTS.SHARE_POST(data.originalPostId));
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content: data.content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to share post');
    }

    const result = await response.json();
    return this.transformPost(result.data);
  }

  async uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }> {
    if (!files || files.length === 0) {
      return { urls: [], publicIds: [] };
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const url = this.getFullUrl('/api/upload/images');
    console.log('[PostApiDataSource] Uploading images to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PostApiDataSource] Upload error:', errorText);
      throw new Error('Failed to upload images');
    }

    const result = await response.json();
    console.log('[PostApiDataSource] Upload result:', result);
    return result.data;
  }

  private transformPost(data: any): Post {
    // Fallback: if backend didn't return populated user, try to use locally stored user
    let user = data.user;
    try {
      if (!user) {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only use if stored user id matches the post userId
          if (parsed && parsed.id && parsed.id === data.userId) {
            user = {
              id: parsed.id,
              userName: parsed.userName,
              email: parsed.email,
              avatar: parsed.avatar
            };
          }
        }
      }
    } catch {
      // ignore localStorage parsing errors
    }

    return {
      id: data.id,
      userId: data.userId,
      user: user,
      content: data.content,
      images: data.images || [],
      likesCount: data.likesCount || 0,
      commentsCount: data.commentsCount || 0,
      sharesCount: data.sharesCount || 0,
      isLiked: data.isLiked || false,
      visibility: data.visibility,
      isEdited: data.isEdited || false,
      editedAt: data.editedAt ? new Date(data.editedAt) : undefined,
      originalPostId: data.originalPostId,
      originalPost: data.originalPost ? this.transformPost(data.originalPost) : undefined,
      sharedBy: data.sharedBy,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private transformResponse(data: any): PaginatedPosts {
    // Ensure each post has user; if backend omitted user for newly created post,
    // try to patch with local user data when possible.
    const posts = data.posts.map((post: any) => {
      const transformed = this.transformPost(post);
      if (!transformed.user) {
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id && parsed.id === transformed.userId) {
              transformed.user = {
                id: parsed.id,
                userName: parsed.userName,
                email: parsed.email,
                avatar: parsed.avatar
              };
            }
          }
  } catch {}
      }
      return transformed;
    });

    return {
      posts,
      pagination: data.pagination,
    };
  }
}
