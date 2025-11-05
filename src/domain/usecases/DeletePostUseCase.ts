import { IPostRepository } from '../repositories/IPostRepository';

export class DeletePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(postId: string): Promise<void> {
    if (!postId || postId.trim().length === 0) {
      throw new Error('Post ID không hợp lệ');
    }

    await this.postRepository.deletePost(postId);
  }
}
