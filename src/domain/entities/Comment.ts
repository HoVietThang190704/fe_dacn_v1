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
  parentCommentId?: string;
  level: number; 
  mentionedUserId?: string;
  mentionedUser?: {
    id: string;
    userName?: string;
    email: string;
    avatar?: string;
  };
  replies?: Comment[]; 
  likesCount: number;
  repliesCount: number;
  isLiked: boolean; 
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  images?: File[];
  parentCommentId?: string;
  mentionedUserId?: string; 
}

export interface UpdateCommentData {
  commentId: string;
  content?: string;
  images?: File[];
}

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
