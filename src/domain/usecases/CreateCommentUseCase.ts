import { ICommentRepository } from '../repositories/ICommentRepository';
import { Comment, CreateCommentData } from '../entities/Comment';

export class CreateCommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(data: CreateCommentData): Promise<Comment> {
    // Validation
    if (!data.postId || data.postId.trim().length === 0) {
      throw new Error('Post ID không hợp lệ');
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Nội dung bình luận không được để trống');
    }

    if (data.content.length > 2000) {
      throw new Error('Nội dung bình luận không được vượt quá 2,000 ký tự');
    }

    if (data.images && data.images.length > 5) {
      throw new Error('Số lượng hình ảnh không được vượt quá 5');
    }

    return await this.commentRepository.createComment(data);
  }
}
