/**
 * Dependency Injection Container for Posts & Comments
 * Manages all dependencies following Clean Architecture
 */

// Data Sources
import { PostApiDataSource } from '@/data/datasources/PostApiDataSource';
import { CommentApiDataSource } from '@/data/datasources/CommentApiDataSource';

// Repositories
import { PostRepository } from '@/data/repositories/PostRepository';
import { CommentRepository } from '@/data/repositories/CommentRepository';

// Use Cases - Posts
import { CreatePostUseCase } from '@/domain/usecases/CreatePostUseCase';
import { UpdatePostUseCase } from '@/domain/usecases/UpdatePostUseCase';
import { DeletePostUseCase } from '@/domain/usecases/DeletePostUseCase';
import { GetPostsFeedUseCase, GetPublicPostsUseCase, GetUserPostsUseCase, SearchPostsUseCase } from '@/domain/usecases/GetPostsUseCase';
import { ToggleLikePostUseCase } from '@/domain/usecases/ToggleLikePostUseCase';
import { SharePostUseCase } from '@/domain/usecases/SharePostUseCase';

// Use Cases - Comments
import { CreateCommentUseCase } from '@/domain/usecases/CreateCommentUseCase';
import { DeleteCommentUseCase } from '@/domain/usecases/DeleteCommentUseCase';
import { GetCommentsByPostIdUseCase, GetCommentRepliesUseCase } from '@/domain/usecases/GetCommentsUseCase';
import { ToggleLikeCommentUseCase } from '@/domain/usecases/ToggleLikeCommentUseCase';

class PostCommentContainer {
  // Singleton instance
  private static instance: PostCommentContainer;

  // Data Sources
  private _postApiDataSource?: PostApiDataSource;
  private _commentApiDataSource?: CommentApiDataSource;

  // Repositories
  private _postRepository?: PostRepository;
  private _commentRepository?: CommentRepository;

  // Use Cases - Posts
  private _createPostUseCase?: CreatePostUseCase;
  private _updatePostUseCase?: UpdatePostUseCase;
  private _deletePostUseCase?: DeletePostUseCase;
  private _getPostsFeedUseCase?: GetPostsFeedUseCase;
  private _getPublicPostsUseCase?: GetPublicPostsUseCase;
  private _getUserPostsUseCase?: GetUserPostsUseCase;
  private _searchPostsUseCase?: SearchPostsUseCase;
  private _toggleLikePostUseCase?: ToggleLikePostUseCase;
  private _sharePostUseCase?: SharePostUseCase;

  // Use Cases - Comments
  private _createCommentUseCase?: CreateCommentUseCase;
  private _deleteCommentUseCase?: DeleteCommentUseCase;
  private _getCommentsByPostIdUseCase?: GetCommentsByPostIdUseCase;
  private _getCommentRepliesUseCase?: GetCommentRepliesUseCase;
  private _toggleLikeCommentUseCase?: ToggleLikeCommentUseCase;

  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    console.log('[PostCommentContainer] Base URL:', this.baseUrl);
  }

  static getInstance(): PostCommentContainer {
    if (!PostCommentContainer.instance) {
      PostCommentContainer.instance = new PostCommentContainer();
    }
    return PostCommentContainer.instance;
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.postApiDataSource.setToken(token);
    this.commentApiDataSource.setToken(token);
  }

  // Data Sources
  get postApiDataSource(): PostApiDataSource {
    if (!this._postApiDataSource) {
      this._postApiDataSource = new PostApiDataSource();
      console.log('[PostCommentContainer] Created PostApiDataSource (using centralized API_CONFIG)');
    }
    return this._postApiDataSource;
  }

  get commentApiDataSource(): CommentApiDataSource {
    if (!this._commentApiDataSource) {
      this._commentApiDataSource = new CommentApiDataSource();
      console.log('[PostCommentContainer] Created CommentApiDataSource (using centralized API_CONFIG)');
    }
    return this._commentApiDataSource;
  }

  // Repositories
  get postRepository(): PostRepository {
    if (!this._postRepository) {
      this._postRepository = new PostRepository(this.postApiDataSource);
    }
    return this._postRepository;
  }

  get commentRepository(): CommentRepository {
    if (!this._commentRepository) {
      this._commentRepository = new CommentRepository(this.commentApiDataSource);
    }
    return this._commentRepository;
  }

  // Post Use Cases
  get createPostUseCase(): CreatePostUseCase {
    if (!this._createPostUseCase) {
      this._createPostUseCase = new CreatePostUseCase(this.postRepository);
    }
    return this._createPostUseCase;
  }

  get updatePostUseCase(): UpdatePostUseCase {
    if (!this._updatePostUseCase) {
      this._updatePostUseCase = new UpdatePostUseCase(this.postRepository);
    }
    return this._updatePostUseCase;
  }

  get deletePostUseCase(): DeletePostUseCase {
    if (!this._deletePostUseCase) {
      this._deletePostUseCase = new DeletePostUseCase(this.postRepository);
    }
    return this._deletePostUseCase;
  }

  get getPostsFeedUseCase(): GetPostsFeedUseCase {
    if (!this._getPostsFeedUseCase) {
      this._getPostsFeedUseCase = new GetPostsFeedUseCase(this.postRepository);
    }
    return this._getPostsFeedUseCase;
  }

  get getPublicPostsUseCase(): GetPublicPostsUseCase {
    if (!this._getPublicPostsUseCase) {
      this._getPublicPostsUseCase = new GetPublicPostsUseCase(this.postRepository);
    }
    return this._getPublicPostsUseCase;
  }

  get getUserPostsUseCase(): GetUserPostsUseCase {
    if (!this._getUserPostsUseCase) {
      this._getUserPostsUseCase = new GetUserPostsUseCase(this.postRepository);
    }
    return this._getUserPostsUseCase;
  }

  get searchPostsUseCase(): SearchPostsUseCase {
    if (!this._searchPostsUseCase) {
      this._searchPostsUseCase = new SearchPostsUseCase(this.postRepository);
    }
    return this._searchPostsUseCase;
  }

  get toggleLikePostUseCase(): ToggleLikePostUseCase {
    if (!this._toggleLikePostUseCase) {
      this._toggleLikePostUseCase = new ToggleLikePostUseCase(this.postRepository);
    }
    return this._toggleLikePostUseCase;
  }

  get sharePostUseCase(): SharePostUseCase {
    if (!this._sharePostUseCase) {
      this._sharePostUseCase = new SharePostUseCase(this.postRepository);
    }
    return this._sharePostUseCase;
  }

  // Comment Use Cases
  get createCommentUseCase(): CreateCommentUseCase {
    if (!this._createCommentUseCase) {
      this._createCommentUseCase = new CreateCommentUseCase(this.commentRepository);
    }
    return this._createCommentUseCase;
  }

  get deleteCommentUseCase(): DeleteCommentUseCase {
    if (!this._deleteCommentUseCase) {
      this._deleteCommentUseCase = new DeleteCommentUseCase(this.commentRepository);
    }
    return this._deleteCommentUseCase;
  }

  get getCommentsByPostIdUseCase(): GetCommentsByPostIdUseCase {
    if (!this._getCommentsByPostIdUseCase) {
      this._getCommentsByPostIdUseCase = new GetCommentsByPostIdUseCase(this.commentRepository);
    }
    return this._getCommentsByPostIdUseCase;
  }

  get getCommentRepliesUseCase(): GetCommentRepliesUseCase {
    if (!this._getCommentRepliesUseCase) {
      this._getCommentRepliesUseCase = new GetCommentRepliesUseCase(this.commentRepository);
    }
    return this._getCommentRepliesUseCase;
  }

  get toggleLikeCommentUseCase(): ToggleLikeCommentUseCase {
    if (!this._toggleLikeCommentUseCase) {
      this._toggleLikeCommentUseCase = new ToggleLikeCommentUseCase(this.commentRepository);
    }
    return this._toggleLikeCommentUseCase;
  }
}

// Export singleton instance
export const postCommentContainer = PostCommentContainer.getInstance();
