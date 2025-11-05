import { Post, CreatePostData, UpdatePostData, SharePostData, PaginatedPosts } from '../entities/Post';

/**
 * Post Repository Interface
 * Defines contract for post data operations
 */
export interface IPostRepository {
  /**
   * Get posts feed
   */
  getFeed(page: number, limit: number): Promise<PaginatedPosts>;

  /**
   * Get posts by user ID
   */
  getPostsByUserId(userId: string, page: number, limit: number): Promise<PaginatedPosts>;

  /**
   * Get public posts
   */
  getPublicPosts(page: number, limit: number): Promise<PaginatedPosts>;

  /**
   * Get post by ID
   */
  getPostById(postId: string): Promise<Post>;

  /**
   * Search posts
   */
  searchPosts(query: string, page: number, limit: number): Promise<PaginatedPosts>;

  /**
   * Get trending posts
   */
  getTrendingPosts(limit?: number, timeWindow?: number): Promise<Post[]>;

  /**
   * Create new post
   */
  createPost(data: CreatePostData): Promise<Post>;

  /**
   * Update post
   */
  updatePost(data: UpdatePostData): Promise<Post>;

  /**
   * Delete post
   */
  deletePost(postId: string): Promise<void>;

  /**
   * Toggle like on post
   */
  toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }>;

  /**
   * Share post
   */
  sharePost(data: SharePostData): Promise<Post>;

  /**
   * Upload images
   */
  uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }>;
}
