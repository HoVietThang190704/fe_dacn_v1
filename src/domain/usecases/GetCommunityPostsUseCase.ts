import { ICommunityRepository, PostsResponse } from '../repositories/ICommunityRepository';

export class GetCommunityPostsUseCase {
  constructor(private communityRepository: ICommunityRepository) {}

  async execute(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    return await this.communityRepository.getPosts(page, limit);
  }
}
