import { CommunityPost, Comment } from '@/domain/entities/Community';
import { PostsResponse, CreatePostDto } from '@/domain/repositories/ICommunityRepository';

export class CommunityApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await fetch(`${this.baseUrl}/community/posts?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getPostById(id: string): Promise<CommunityPost> {
    const response = await fetch(`${this.baseUrl}/community/posts/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async createPost(post: CreatePostDto): Promise<CommunityPost> {
    const response = await fetch(`${this.baseUrl}/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async likePost(postId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/community/posts/${postId}/like`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to like post: ${response.statusText}`);
    }
  }

  async unlikePost(postId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/community/posts/${postId}/unlike`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to unlike post: ${response.statusText}`);
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await fetch(`${this.baseUrl}/community/posts/${postId}/comments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async addComment(postId: string, content: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
