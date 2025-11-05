/**
 * Comment Entity - Frontend Domain Model
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: {
    id: string;
    userName?: string;
    email: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  
  // Nested structure (3 levels)
  parentCommentId?: string;
  level: number; // 0 = top-level, 1 = reply, 2 = nested reply
  mentionedUserId?: string; // User being replied to
  mentionedUser?: {
    id: string;
    userName?: string;
    email: string;
    avatar?: string;
  };
  replies?: Comment[]; // Nested replies
  
  // Engagement
  likesCount: number;
  repliesCount: number;
  isLiked: boolean; // If current user has liked
  
  // Metadata
  isEdited: boolean;
  editedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Comment Data
 */
export interface CreateCommentData {
  postId: string;
  content: string;
  images?: File[];
  parentCommentId?: string; // For replies
  mentionedUserId?: string; // User being replied to
}

/**
 * Update Comment Data
 */
export interface UpdateCommentData {
  commentId: string;
  content?: string;
  images?: File[];
}

/**
 * Paginated Comments Response
 */
export interface PaginatedComments {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
