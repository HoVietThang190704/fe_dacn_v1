/**
 * Repository Implementation: Community
 * Implements domain repository interface using data sources
 */
import { ICommunityRepository, PostsResponse, CreatePostDto } from '@/domain/repositories/ICommunityRepository';
import { CommunityPost, Comment } from '@/domain/entities/Community';
import { CommunityApiDataSource } from '../datasources/CommunityApiDataSource';

export class CommunityRepositoryImpl implements ICommunityRepository {
  constructor(private apiDataSource: CommunityApiDataSource) {}

  async getPosts(page?: number, limit?: number): Promise<PostsResponse> {
    return await this.apiDataSource.getPosts(page, limit);
  }

  async getPostById(id: string): Promise<CommunityPost> {
    return await this.apiDataSource.getPostById(id);
  }

  async createPost(post: CreatePostDto): Promise<CommunityPost> {
    return await this.apiDataSource.createPost(post);
  }

  async likePost(postId: string): Promise<void> {
    return await this.apiDataSource.likePost(postId);
  }

  async unlikePost(postId: string): Promise<void> {
    return await this.apiDataSource.unlikePost(postId);
  }

  async getComments(postId: string): Promise<Comment[]> {
    return await this.apiDataSource.getComments(postId);
  }

  async addComment(postId: string, content: string): Promise<Comment> {
    return await this.apiDataSource.addComment(postId, content);
  }
}
