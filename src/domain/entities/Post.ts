/**
 * Post Entity - Frontend Domain Model
 */
export interface Post {
  id: string;
  userId: string;
  user?: {
    id: string;
    userName?: string;
    email: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  
  // Engagement
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean; // If current user has liked
  
  // Metadata
  visibility: 'public' | 'friends' | 'private';
  isEdited: boolean;
  editedAt?: Date;
  
  // Sharing
  originalPostId?: string;
  originalPost?: Post; // Nested post if shared
  sharedBy?: {
    id: string;
    userName?: string;
    avatar?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Post Data
 */
export interface CreatePostData {
  content: string;
  images?: File[];
  visibility?: 'public' | 'friends' | 'private';
}

/**
 * Update Post Data
 */
export interface UpdatePostData {
  postId: string;
  content?: string;
  images?: File[];
  visibility?: 'public' | 'friends' | 'private';
}

/**
 * Share Post Data
 */
export interface SharePostData {
  originalPostId: string;
  content?: string;
}

/**
 * Post Filters
 */
export interface PostFilters {
  userId?: string;
  visibility?: 'public' | 'friends' | 'private';
  search?: string;
}

/**
 * Paginated Posts Response
 */
export interface PaginatedPosts {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
