'use client';

import { useEffect } from 'react';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';

/**
 * AuthProvider - Manages authentication state and token injection
 * This component ensures that the auth token is always available 
 * in the API data sources when the user is authenticated
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Function to load and set token
    const loadAuthToken = () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          console.log('[AuthProvider] Token found, setting to container');
          postCommentContainer.setAuthToken(token);
        } else {
          console.log('[AuthProvider] No token found');
        }
      } catch (error) {
        console.error('[AuthProvider] Error loading auth token:', error);
      }
    };

    // Load token on mount
    loadAuthToken();

    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          console.log('[AuthProvider] Token updated, setting to container');
          postCommentContainer.setAuthToken(e.newValue);
        } else {
          console.log('[AuthProvider] Token removed');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}
