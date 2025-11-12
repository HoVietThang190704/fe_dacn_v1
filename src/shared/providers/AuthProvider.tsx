'use client';

import { useEffect } from 'react';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
    loadAuthToken();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          console.log('[AuthProvider] Token updated, setting to container');
          postCommentContainer.setAuthToken(e.newValue);
        } else {
          console.log('[AuthProvider] Token removed');
          postCommentContainer.setAuthToken('');
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
