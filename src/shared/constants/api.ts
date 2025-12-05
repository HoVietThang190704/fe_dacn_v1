const normalizeUrl = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

export const API_CONFIG = {
  BASE_URL: normalizeUrl(process.env.NEXT_PUBLIC_API_URL),
  SOCKET_URL: normalizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('[API_CONFIG] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('[API_CONFIG] BASE_URL:', API_CONFIG.BASE_URL);
  console.log('[API_CONFIG] SOCKET_URL:', API_CONFIG.SOCKET_URL);
}

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  AUTH_PROFILE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
  // Google auth (id_token -> backend)
  AUTH_GOOGLE_TOKEN: '/api/auth/google/token',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
  PRODUCT_CATEGORIES: '/api/categories',
  PRODUCT_SEARCH: '/api/products/search',
  BEST_SELLING: '/api/products/best-selling',
  NEW_PRODUCTS: '/api/products/new',
  PRODUCT_REVIEWS: '/api/product-reviews',
  PRODUCT_REVIEWS_BY_PRODUCT: (productId: string) => `/api/product-reviews/product/${productId}`,
  PRODUCT_REVIEW_DETAIL: (reviewId: string) => `/api/product-reviews/${reviewId}`,
  PRODUCT_SHARE_INFO: (productId: string) => `/api/products/${productId}/share-info`,
  
  // Orders (user-specific endpoints under /api/users/me/... as per docs)
  ORDERS: '/api/users/me/orders',
  ORDER_STATISTICS: '/api/users/me/orders/statistics',
  ORDER_DETAIL: (id: string) => `/api/users/me/orders/${id}`,
  ORDER_PAYMENT_STATUS: (id: string) => `/api/users/me/orders/${id}/payment-status`,
  CANCEL_ORDER: (id: string) => `/api/users/me/orders/${id}/cancel`,
  CONFIRM_ORDER_DELIVERED: (id: string) => `/api/users/me/orders/${id}/confirm-delivered`,
  MANAGED_ORDERS: '/api/users/me/manage/orders',
  MANAGED_ORDER_DETAIL: (id: string) => `/api/users/me/manage/orders/${id}`,
  MANAGED_ORDER_STATUS: (id: string) => `/api/users/me/manage/orders/${id}/status`,
  USER_VOUCHERS: '/api/users/me/vouchers',
  APPLY_VOUCHER: '/api/users/me/vouchers/apply',
  PAYMENT_VNPAY_CREATE: '/api/payments/vnpay/create',
  
  BANNERS: '/api/banners/active',
  PROMOTIONS: '/api/promotions/active',
  
  // User endpoints (current user)
  USER_PROFILE: '/api/users/me/profile',
  UPDATE_PROFILE: '/api/users/me/profile',
  UPLOAD_AVATAR: '/api/users/me/avatar',
  USER_ADDRESSES: '/api/users/me/addresses',
  USER_ADDRESS_DETAIL: (id: string) => `/api/users/me/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/api/users/me/addresses/${id}/default`,
  REGISTER_SHOP_OWNER: '/api/register-shop-owner',
  REGISTER_SHOP_OWNER_ME: '/api/register-shop-owner/me',
  
  WISHLIST: '/api/wishlist',
  WISHLIST_ITEM: (productId: string) => `/api/wishlist/${productId}`,
  WISHLIST_TOGGLE: (productId: string) => `/api/wishlist/toggle/${productId}`,
  
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
  // Search
  GLOBAL_SEARCH: '/api/v1/search',
  SEARCH_SUGGEST: '/api/search/suggest',
  POST_DETAIL: (postId: string) => `/api/posts/${postId}`,
  CREATE_POST: '/api/posts',
  UPDATE_POST: (postId: string) => `/api/posts/${postId}`,
  DELETE_POST: (postId: string) => `/api/posts/${postId}`,
  TOGGLE_LIKE_POST: (postId: string) => `/api/posts/${postId}/like`,
  POST_SHARE_INFO: (postId: string) => `/api/posts/${postId}/share-info`,
  SHARE_POST: (postId: string) => `/api/posts/${postId}/share`,
  
  // Comments
  COMMENTS_BY_POST: (postId: string) => `/api/comments/post/${postId}`,
  COMMENT_BY_ID: (commentId: string) => `/api/comments/${commentId}`,
  COMMENT_REPLIES: (commentId: string) => `/api/comments/${commentId}/replies`,
  CREATE_COMMENT: '/api/comments',
  UPDATE_COMMENT: (commentId: string) => `/api/comments/${commentId}`,
  DELETE_COMMENT: (commentId: string) => `/api/comments/${commentId}`,
  TOGGLE_LIKE_COMMENT: (commentId: string) => `/api/comments/${commentId}/like`,

  // Cart
  CART: '/api/cart',
  CART_ITEMS: '/api/cart/items',
  CART_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,

  // Support
  SUPPORT_TICKETS: '/api/tickets',
  SUPPORT_TICKET_DETAIL: (id: string) => `/api/tickets/${id}`,
  SUPPORT_TICKET_STATUS: (id: string) => `/api/tickets/${id}/status`,
  SUPPORT_FAQS: '/api/support/faqs',
  SUPPORT_FAQ_SEARCH: '/api/support/faqs/search',
  SUPPORT_FAQ_VOTE: (id: string) => `/api/support/faqs/${id}/vote`,
  SUPPORT_CHAT_THREAD: '/api/support/chat/thread',
  SUPPORT_CHAT_MESSAGES: '/api/support/chat/messages',
  SUPPORT_CHAT_THREAD_READ: '/api/support/chat/thread/read',
  AI_CHAT: '/api/ai/chat',

  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_MARK_READ: (id: string) => `/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',
  NOTIFICATIONS_SUMMARY: '/api/notifications/summary',
} as const;
