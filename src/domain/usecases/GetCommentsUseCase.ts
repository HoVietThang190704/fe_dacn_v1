import { ICommentRepository } from '../repositories/ICommentRepository';
import { PaginatedComments } from '../entities/Comment';

export class GetCommentsByPostIdUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(postId: string, page: number = 1, limit: number = 20, withNested: boolean = false): Promise<PaginatedComments> {
    if (!postId || postId.trim().length === 0) {
      throw new Error('Post ID không hợp lệ');
    }

    if (withNested) {
      return await this.commentRepository.getCommentsWithNested(postId, page, limit);
    }

    return await this.commentRepository.getCommentsByPostId(postId, page, limit);
  }
}

export class GetCommentRepliesUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(parentCommentId: string, page: number = 1, limit: number = 10): Promise<PaginatedComments> {
    if (!parentCommentId || parentCommentId.trim().length === 0) {
      throw new Error('Parent Comment ID không hợp lệ');
    }

    return await this.commentRepository.getReplies(parentCommentId, page, limit);
  }
}
