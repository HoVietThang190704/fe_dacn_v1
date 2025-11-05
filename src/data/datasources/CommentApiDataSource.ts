import { Comment, CreateCommentData, UpdateCommentData, PaginatedComments } from '@/domain/entities/Comment';
import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';

export class CommentApiDataSource {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token || null;
    console.log('[CommentApiDataSource] Token set:', this.token ? 'Yes (length: ' + this.token.length + ')' : 'No');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // If token was not explicitly set on the container, try to read from localStorage as a fallback
    const tokenToUse = this.token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    if (tokenToUse) {
      headers['Authorization'] = `Bearer ${tokenToUse}`;
    }
    
    return headers;
  }

  private getFullUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  async getCommentsByPostId(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedComments> {
    const url = this.getFullUrl(API_ENDPOINTS.COMMENTS_BY_POST(postId)) + `?page=${page}&limit=${limit}`;
    console.log('[CommentApiDataSource] Fetching comments from:', url);
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformResponse(result.data);
  }

  async getCommentsWithNested(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedComments> {
    const url = this.getFullUrl(API_ENDPOINTS.COMMENTS_BY_POST(postId)) + `?withNested=true&page=${page}&limit=${limit}`;
    console.log('[CommentApiDataSource] Fetching nested comments from:', url);
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformResponse(result.data);
  }

  async getReplies(parentCommentId: string, page: number = 1, limit: number = 20): Promise<PaginatedComments> {
    const url = this.getFullUrl(API_ENDPOINTS.COMMENT_REPLIES(parentCommentId)) + `?page=${page}&limit=${limit}`;
    console.log('[CommentApiDataSource] Fetching replies from:', url);
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch replies: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformResponse(result.data);
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const url = this.getFullUrl(API_ENDPOINTS.COMMENT_BY_ID(commentId));
    console.log('[CommentApiDataSource] Fetching comment from:', url);
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformComment(result.data);
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    // First upload images if any
    let imageUrls: string[] = [];
    let cloudinaryPublicIds: string[] = [];

    if (data.images && data.images.length > 0) {
      const uploadResult = await this.uploadImages(data.images);
      imageUrls = uploadResult.urls;
      cloudinaryPublicIds = uploadResult.publicIds;
    }

    const url = this.getFullUrl(API_ENDPOINTS.CREATE_COMMENT);
    console.log('[CommentApiDataSource] Creating comment at:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        postId: data.postId,
        content: data.content,
        images: imageUrls,
        cloudinaryPublicIds,
        parentCommentId: data.parentCommentId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create comment');
    }

    const result = await response.json();
    return this.transformComment(result.data);
  }

  async updateComment(data: UpdateCommentData): Promise<Comment> {
    // Upload new images if any
    let imageUrls: string[] | undefined;
    let cloudinaryPublicIds: string[] | undefined;

    if (data.images && data.images.length > 0) {
      const uploadResult = await this.uploadImages(data.images);
      imageUrls = uploadResult.urls;
      cloudinaryPublicIds = uploadResult.publicIds;
    }

    const url = this.getFullUrl(API_ENDPOINTS.UPDATE_COMMENT(data.commentId));
    console.log('[CommentApiDataSource] Updating comment at:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content: data.content,
        images: imageUrls,
        cloudinaryPublicIds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update comment');
    }

    const result = await response.json();
    return this.transformComment(result.data);
  }

  async deleteComment(commentId: string): Promise<void> {
    const url = this.getFullUrl(API_ENDPOINTS.DELETE_COMMENT(commentId));
    console.log('[CommentApiDataSource] Deleting comment at:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }
  }

  async toggleLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const url = this.getFullUrl(API_ENDPOINTS.TOGGLE_LIKE_COMMENT(commentId));
    console.log('[CommentApiDataSource] Toggling like at:', url);
    
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

  async uploadImages(_files: File[]): Promise<{ urls: string[]; publicIds: string[] }> {
    // TODO: Implement upload images endpoint when backend is ready
    console.warn('[CommentApiDataSource] Image upload not implemented yet, returning empty arrays');
    return { urls: [], publicIds: [] };

    /* When backend is ready, uncomment this:
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const url = this.getFullUrl('/upload/images');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    const result = await response.json();
    return result.data;
    */
  }

  private transformComment(data: Record<string, unknown>): Comment {
    const userObj = data.user as unknown as Record<string, unknown> | undefined;
    const userVal = userObj && userObj.id && userObj.email ? {
      id: String(userObj.id),
      userName: userObj.userName as string | undefined,
      email: String(userObj.email),
      avatar: userObj.avatar as string | undefined
    } : undefined;

    return {
      id: data.id as string,
      postId: data.postId as string,
      userId: data.userId as string,
      user: userVal,
      content: data.content as string,
      images: (data.images as string[]) || [],
      parentCommentId: data.parentCommentId as string | undefined,
      level: (data.level as number) || 0,
      replies: (data.replies as unknown as Record<string, unknown>[] )?.map((reply) => this.transformComment(reply)),
      likesCount: (data.likesCount as number) || 0,
      repliesCount: (data.repliesCount as number) || 0,
      isLiked: (data.isLiked as boolean) || false,
      isEdited: (data.isEdited as boolean) || false,
      editedAt: data.editedAt ? new Date(data.editedAt as string) : undefined,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
    };
  }

  private transformResponse(data: Record<string, unknown>): PaginatedComments {
    return {
      comments: ((data.comments as unknown as Record<string, unknown>[] ) || []).map((comment) => this.transformComment(comment)),
      pagination: data.pagination as unknown as { page: number; limit: number; total: number; totalPages: number; hasMore: boolean },
    };
  }
}
