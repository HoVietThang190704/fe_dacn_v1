export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL|| ""  ,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_CATEGORIES: '/categories',
  PRODUCT_SEARCH: '/products/search',
  BEST_SELLING: '/products/best-selling',
  NEW_PRODUCTS: '/products/new',
  
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  CREATE_ORDER: '/orders',
  UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/status`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  
  BANNERS: '/banners/active',
  PROMOTIONS: '/promotions/active',
  
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  
  FAVORITES: '/favorites',
  ADD_FAVORITE: '/favorites',
  REMOVE_FAVORITE: (id: string) => `/favorites/${id}`,
} as const;
