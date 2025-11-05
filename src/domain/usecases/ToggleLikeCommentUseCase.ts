import { ICommentRepository } from '../repositories/ICommentRepository';

export class ToggleLikeCommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    if (!commentId || commentId.trim().length === 0) {
      throw new Error('Comment ID không hợp lệ');
    }

    return await this.commentRepository.toggleLike(commentId);
  }
}
