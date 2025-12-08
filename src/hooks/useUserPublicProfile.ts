import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '@/lib/api';

export interface UserPublicProfile {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
}

interface UseUserPublicProfileResult {
  profile: UserPublicProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUserPublicProfile(userId: string): UseUserPublicProfileResult {
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId || userId.trim().length === 0) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await usersAPI.getPublicProfile(userId);

      if (response.success && response.data) {
        setProfile({
          id: response.data.id,
          userName: response.data.userName,
          email: response.data.email,
          avatar: response.data.avatar,
          role: response.data.role,
          isVerified: response.data.isVerified,
        });
      } else {
        setError(response.error || 'Failed to load user profile');
        setProfile(null);
      }
    } catch (err) {
      console.error('[useUserPublicProfile] fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
  };
}
