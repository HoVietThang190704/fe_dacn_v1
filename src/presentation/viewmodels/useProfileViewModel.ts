/**
 * ViewModel: Profile Page
 * - Accepts an optional GetUserProfileUseCase to fetch up-to-date profile from domain layer
 * - Falls back to the client-side `useAuth` user when use case is not provided
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';

export type UserProfile = {
  id: string;
  userName: string;
  email: string;
  phone?: string;
  role?: string;
  isVerified?: boolean;
};

export type GetUserProfileUseCase = {
  execute: (userId: string) => Promise<UserProfile>;
};

export const useProfileViewModel = (getUserProfileUseCase?: GetUserProfileUseCase) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!getUserProfileUseCase);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (userId?: string) => {
    if (!getUserProfileUseCase) {
      // No use case provided: use local auth user
      if (user) {
        setProfile({
          id: user.id,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        });
      }
      return;
    }

    if (!userId && user) userId = user.id;
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserProfileUseCase.execute(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load when mounted. Prefer use case; otherwise rely on auth hook
    if (getUserProfileUseCase) {
      loadProfile();
    } else if (user) {
      loadProfile(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    profile,
    isLoading,
    error,
    refresh: () => loadProfile(user?.id),
  };
};
