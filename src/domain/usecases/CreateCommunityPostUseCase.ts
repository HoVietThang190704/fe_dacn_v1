import { ICommunityRepository, CreatePostDto } from '../repositories/ICommunityRepository';
import { CommunityPost } from '../entities/Community';

export class CreateCommunityPostUseCase {
  constructor(private communityRepository: ICommunityRepository) {}

  async execute(post: CreatePostDto): Promise<CommunityPost> {
    return await this.communityRepository.createPost(post);
  }
}