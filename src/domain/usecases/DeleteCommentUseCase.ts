import { ICommentRepository } from '../repositories/ICommentRepository';

export class DeleteCommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(commentId: string): Promise<void> {
    if (!commentId || commentId.trim().length === 0) {
      throw new Error('Comment ID không hợp lệ');
    }

    await this.commentRepository.deleteComment(commentId);
  }
}
