import { Post, CreatePostData, UpdatePostData, SharePostData, PaginatedPosts } from '../entities/Post';
export interface IPostRepository {
  getFeed(page: number, limit: number): Promise<PaginatedPosts>;
  getPostsByUserId(userId: string, page: number, limit: number): Promise<PaginatedPosts>;
  getPublicPosts(page: number, limit: number): Promise<PaginatedPosts>;
  getPostById(postId: string): Promise<Post>;
  searchPosts(query: string, page: number, limit: number): Promise<PaginatedPosts>;
  getTrendingPosts(limit?: number, timeWindow?: number): Promise<Post[]>;
  createPost(data: CreatePostData): Promise<Post>;
  updatePost(data: UpdatePostData): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }>;
  sharePost(data: SharePostData): Promise<Post>;
  uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }>;
}
