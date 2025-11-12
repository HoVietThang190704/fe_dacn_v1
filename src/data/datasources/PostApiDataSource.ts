import { Post, CreatePostData, UpdatePostData, SharePostData, PaginatedPosts } from '@/domain/entities/Post';
import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';
import { authApiClient } from '@/lib/authApiClient';

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
    const response = await authApiClient.get<{ success: boolean; data: unknown }>(`${API_ENDPOINTS.POSTS_FEED_USER}?page=${page}&limit=${limit}`);
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || `Failed to fetch feed`);
    }
    return this.transformResponse(response.data.data as Record<string, unknown>);
  }

  async getPostsByUserId(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    const response = await authApiClient.get<{ success: boolean; data: unknown }>(`${API_ENDPOINTS.POSTS_USER(userId)}?page=${page}&limit=${limit}`);
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || `Failed to fetch user posts`);
    }
    return this.transformResponse(response.data.data as Record<string, unknown>);
  }

  async getPublicPosts(page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    console.log('[PostApiDataSource] Fetching public posts');
    const response = await authApiClient.get<{ success: boolean; data: unknown }>(`${API_ENDPOINTS.POSTS_FEED_PUBLIC}?page=${page}&limit=${limit}`);
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || `Failed to fetch public posts`);
    }
    console.log('[PostApiDataSource] API Response received');
    return this.transformResponse(response.data.data as Record<string, unknown>);
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
    return (result.data as unknown as Record<string, unknown>[]).map((post) => this.transformPost(post as Record<string, unknown>));
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
    const keptImages = data.existingImageUrls ? [...data.existingImageUrls] : undefined;
    const newFiles = data.newImages ?? [];

    let uploadedUrls: string[] = [];
    let uploadedPublicIds: string[] = [];

    if (newFiles.length > 0) {
      const uploadResult = await this.uploadImages(newFiles);
      uploadedUrls = uploadResult.urls;
      uploadedPublicIds = uploadResult.publicIds;
    }

    const shouldUpdateImages = (typeof keptImages !== 'undefined') || uploadedUrls.length > 0;
    const finalImages = shouldUpdateImages
      ? [...(keptImages ?? []), ...uploadedUrls]
      : undefined;

    let cloudinaryPublicIds: string[] | undefined;
    if (shouldUpdateImages) {
      if ((keptImages?.length ?? 0) === 0 && uploadedPublicIds.length > 0) {
        cloudinaryPublicIds = uploadedPublicIds;
      } else if ((keptImages?.length ?? 0) === 0 && uploadedPublicIds.length === 0) {
        cloudinaryPublicIds = [];
      }
      // When mixing existing and new images we skip sending cloudinary ids to avoid mismatch
    }

    const payload: Record<string, unknown> = {};
    if (data.content !== undefined) {
      payload.content = data.content;
    }
    if (data.visibility !== undefined) {
      payload.visibility = data.visibility;
    }
    if (shouldUpdateImages) {
      payload.images = finalImages;
      if (cloudinaryPublicIds !== undefined) {
        payload.cloudinaryPublicIds = cloudinaryPublicIds;
      }
    }

    const url = this.getFullUrl(API_ENDPOINTS.UPDATE_POST(data.postId));
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
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

  private transformPost(data: Record<string, unknown>): Post {
    // Fallback: if backend didn't return populated user, try to use locally stored user
    const userObj = data.user as unknown as Record<string, unknown> | undefined;
    let user = undefined as { id: string; userName?: string; email: string; avatar?: string } | undefined;
    if (userObj && userObj.id && userObj.email) {
      user = {
        id: String(userObj.id),
        userName: userObj.userName as string | undefined,
        email: String(userObj.email),
        avatar: userObj.avatar as string | undefined,
      };
    } else {
      user = undefined;
    }
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
      id: String(data.id),
      userId: String(data.userId),
      user: user,
      content: String(data.content),
      images: (data.images as unknown as string[]) || [],
      likesCount: (data.likesCount as number) || 0,
      commentsCount: (data.commentsCount as number) || 0,
      sharesCount: (data.sharesCount as number) || 0,
      isLiked: (data.isLiked as boolean) || false,
  visibility: ((data.visibility as string) || 'public') as 'public' | 'friends' | 'private',
      isEdited: (data.isEdited as boolean) || false,
      editedAt: data.editedAt ? new Date(String(data.editedAt)) : undefined,
      originalPostId: data.originalPostId as string | undefined,
      originalPost: data.originalPost ? this.transformPost(data.originalPost as Record<string, unknown>) : undefined,
      sharedBy: (() => {
        const sb = data.sharedBy as unknown as Record<string, unknown> | undefined;
        if (sb && sb.id) {
          return {
            id: String(sb.id),
            userName: sb.userName as string | undefined,
            avatar: sb.avatar as string | undefined,
          };
        }
        return undefined;
      })(),
      createdAt: new Date(String(data.createdAt)),
      updatedAt: new Date(String(data.updatedAt)),
    };
  }

  private transformResponse(data: Record<string, unknown>): PaginatedPosts {
    // Ensure each post has user; if backend omitted user for newly created post,
    // try to patch with local user data when possible.
    const posts = (data.posts as unknown as Record<string, unknown>[]).map((post) => {
      const transformed = this.transformPost(post as Record<string, unknown>);
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
      pagination: data.pagination as unknown as { total: number; page: number; limit: number; totalPages: number; hasMore: boolean },
    };
  }
}
