export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('[API_CONFIG] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('[API_CONFIG] BASE_URL:', API_CONFIG.BASE_URL);
}

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  AUTH_PROFILE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
  PRODUCT_CATEGORIES: '/api/categories',
  PRODUCT_SEARCH: '/api/products/search',
  BEST_SELLING: '/api/products/best-selling',
  NEW_PRODUCTS: '/api/products/new',
  
  // Orders (user-specific endpoints under /api/users/me/... as per docs)
  ORDERS: '/api/users/me/orders',
  ORDER_STATISTICS: '/api/users/me/orders/statistics',
  ORDER_DETAIL: (id: string) => `/api/users/me/orders/${id}`,
  CREATE_ORDER: '/api/orders',
  UPDATE_ORDER_STATUS: (id: string) => `/api/orders/${id}/status`,
  CANCEL_ORDER: (id: string) => `/api/users/me/orders/${id}/cancel`,
  
  BANNERS: '/api/banners/active',
  PROMOTIONS: '/api/promotions/active',
  
  // User endpoints (current user)
  USER_PROFILE: '/api/users/me/profile',
  UPDATE_PROFILE: '/api/users/me/profile',
  UPLOAD_AVATAR: '/api/users/me/avatar',
  USER_ADDRESSES: '/api/users/me/addresses',
  USER_ADDRESS_DETAIL: (id: string) => `/api/users/me/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/api/users/me/addresses/${id}/default`,
  
  FAVORITES: '/api/favorites',
  ADD_FAVORITE: '/api/favorites',
  REMOVE_FAVORITE: (id: string) => `/api/favorites/${id}`,
  
  // Livestreams
  LIVESTREAMS: '/api/livestreams',
  LIVESTREAM_DETAIL: (id: string) => `/api/livestreams/${id}`,
  CREATE_LIVESTREAM: '/api/livestreams',
  UPDATE_LIVESTREAM: (id: string) => `/api/livestreams/${id}`,
  UPDATE_LIVESTREAM_STATUS: (id: string) => `/api/livestreams/${id}/status`,
  
  // Agora
  AGORA_TOKEN: '/api/agora/token',
  
  // Posts & Community
  POSTS_FEED_PUBLIC: '/api/posts/feed/public',
  POSTS_FEED_USER: '/api/posts/feed/user',
  POSTS_USER: (userId: string) => `/api/posts/user/${userId}`,
  POSTS_SEARCH: '/api/posts/search/query',
  POSTS_TRENDING: '/api/posts/trending/now',
  POST_DETAIL: (postId: string) => `/api/posts/${postId}`,
  CREATE_POST: '/api/posts',
  UPDATE_POST: (postId: string) => `/api/posts/${postId}`,
  DELETE_POST: (postId: string) => `/api/posts/${postId}`,
  TOGGLE_LIKE_POST: (postId: string) => `/api/posts/${postId}/like`,
  SHARE_POST: (postId: string) => `/api/posts/${postId}/share`,
  
  // Comments
  COMMENTS_BY_POST: (postId: string) => `/api/comments/post/${postId}`,
  COMMENT_BY_ID: (commentId: string) => `/api/comments/${commentId}`,
  COMMENT_REPLIES: (commentId: string) => `/api/comments/${commentId}/replies`,
  CREATE_COMMENT: '/api/comments',
  UPDATE_COMMENT: (commentId: string) => `/api/comments/${commentId}`,
  DELETE_COMMENT: (commentId: string) => `/api/comments/${commentId}`,
  TOGGLE_LIKE_COMMENT: (commentId: string) => `/api/comments/${commentId}/like`,
} as const;
