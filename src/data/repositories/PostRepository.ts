import { IPostRepository } from '@/domain/repositories/IPostRepository';
import { Post, CreatePostData, UpdatePostData, SharePostData, PaginatedPosts } from '@/domain/entities/Post';
import { PostApiDataSource } from '../datasources/PostApiDataSource';

export class PostRepository implements IPostRepository {
  constructor(private apiDataSource: PostApiDataSource) {}

  async getFeed(page: number, limit: number): Promise<PaginatedPosts> {
    return await this.apiDataSource.getFeed(page, limit);
  }

  async getPostsByUserId(userId: string, page: number, limit: number): Promise<PaginatedPosts> {
    return await this.apiDataSource.getPostsByUserId(userId, page, limit);
  }

  async getPublicPosts(page: number, limit: number): Promise<PaginatedPosts> {
    return await this.apiDataSource.getPublicPosts(page, limit);
  }

  async getPostById(postId: string): Promise<Post> {
    return await this.apiDataSource.getPostById(postId);
  }

  async searchPosts(query: string, page: number, limit: number): Promise<PaginatedPosts> {
    return await this.apiDataSource.searchPosts(query, page, limit);
  }

  async getTrendingPosts(limit?: number, timeWindow?: number): Promise<Post[]> {
    return await this.apiDataSource.getTrendingPosts(limit, timeWindow);
  }

  async createPost(data: CreatePostData): Promise<Post> {
    return await this.apiDataSource.createPost(data);
  }

  async updatePost(data: UpdatePostData): Promise<Post> {
    return await this.apiDataSource.updatePost(data);
  }

  async deletePost(postId: string): Promise<void> {
    await this.apiDataSource.deletePost(postId);
  }

  async toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    return await this.apiDataSource.toggleLike(postId);
  }

  async sharePost(data: SharePostData): Promise<Post> {
    return await this.apiDataSource.sharePost(data);
  }

  async uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }> {
    return await this.apiDataSource.uploadImages(files);
  }
}
