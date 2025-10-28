export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL|| ""  ,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  AUTH_PROFILE: '/api/auth/profile',
  
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
  USER_ADDRESSES: '/api/users/me/addresses',
  USER_ADDRESS_DETAIL: (id: string) => `/api/users/me/addresses/${id}`,
  
  FAVORITES: '/api/favorites',
  ADD_FAVORITE: '/api/favorites',
  REMOVE_FAVORITE: (id: string) => `/api/favorites/${id}`,
} as const;
