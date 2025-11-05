import { ICommentRepository } from '@/domain/repositories/ICommentRepository';
import { Comment, CreateCommentData, UpdateCommentData, PaginatedComments } from '@/domain/entities/Comment';
import { CommentApiDataSource } from '../datasources/CommentApiDataSource';

export class CommentRepository implements ICommentRepository {
  constructor(private apiDataSource: CommentApiDataSource) {}

  async getCommentsByPostId(postId: string, page: number, limit: number): Promise<PaginatedComments> {
    return await this.apiDataSource.getCommentsByPostId(postId, page, limit);
  }

  async getCommentsWithNested(postId: string, page: number, limit: number): Promise<PaginatedComments> {
    return await this.apiDataSource.getCommentsWithNested(postId, page, limit);
  }

  async getReplies(parentCommentId: string, page: number, limit: number): Promise<PaginatedComments> {
    return await this.apiDataSource.getReplies(parentCommentId, page, limit);
  }

  async getCommentById(commentId: string): Promise<Comment> {
    return await this.apiDataSource.getCommentById(commentId);
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    return await this.apiDataSource.createComment(data);
  }

  async updateComment(data: UpdateCommentData): Promise<Comment> {
    return await this.apiDataSource.updateComment(data);
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.apiDataSource.deleteComment(commentId);
  }

  async toggleLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    return await this.apiDataSource.toggleLike(commentId);
  }

  async uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }> {
    return await this.apiDataSource.uploadImages(files);
  }
}
