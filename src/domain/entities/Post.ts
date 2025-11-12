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
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean; 
  visibility: 'public' | 'friends' | 'private';
  isEdited: boolean;
  editedAt?: Date;
  originalPostId?: string;
  originalPost?: Post; 
  sharedBy?: {
    id: string;
    userName?: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface CreatePostData {
  content: string;
  images?: File[];
  visibility?: 'public' | 'friends' | 'private';
}
export interface UpdatePostData {
  postId: string;
  content?: string;
  visibility?: 'public' | 'friends' | 'private';
  existingImageUrls?: string[];
  newImages?: File[];
}
export interface SharePostData {
  originalPostId: string;
  content?: string;
}
export interface PostFilters {
  userId?: string;
  visibility?: 'public' | 'friends' | 'private';
  search?: string;
}
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
