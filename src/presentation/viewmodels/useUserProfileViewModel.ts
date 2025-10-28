"use client";

import { useState, useEffect, useCallback } from 'react';
import { UpdateUserProfileUseCase } from '@/domain/usecases/UpdateUserProfileUseCase';
import { User, UpdateUserDto } from '@/domain/entities/User';
import { usersAPI } from '@/lib/api';

export const useUserProfileViewModel = (
  updateUserProfileUseCase: UpdateUserProfileUseCase,
  userId: string
) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const parseRawUser = (payload: unknown, fallbackId: string): User | null => {
    if (!payload || typeof payload !== 'object') return null;
    const obj = payload as Record<string, unknown>;
    const raw = ('data' in obj && typeof obj.data === 'object') ? (obj.data as Record<string, unknown>) : ('user' in obj && typeof obj.user === 'object') ? (obj.user as Record<string, unknown>) : obj;

    const id = (raw._id as string) || (raw.id as string) || fallbackId;
    const email = (raw.email as string) || '';
    const name = (raw.name as string) || (raw.userName as string) || '';
    const userName = (raw.userName as string) || undefined;
    const phone = (raw.phone as string) || undefined;
    const address = (raw.address as string) || undefined;
    const gender = (raw.gender as 'male' | 'female' | 'other') || undefined;
    const birthDate = raw.birthDate ? new Date(raw.birthDate as string) : undefined;
    const role = (raw.role as string) || undefined;
    const isVerified = typeof raw.isVerified === 'boolean' ? (raw.isVerified as boolean) : undefined;
    const createdAt = raw.createdAt ? new Date(raw.createdAt as string) : new Date();
    const updatedAt = raw.updatedAt ? new Date(raw.updatedAt as string) : new Date();

    return {
      id,
      email,
      name,
      userName,
      phone,
      address,
      gender,
      birthDate,
      role,
      isVerified,
      createdAt,
      updatedAt,
    } as User;
  };

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')) : undefined;
      const resp = await usersAPI.getMyProfile(token || undefined, true);
      console.debug('[useUserProfileViewModel] usersAPI.getMyProfile response:', resp);
      const payload = resp.data ?? null;
      const parsed = parseRawUser(payload, userId);
      console.debug('[useUserProfileViewModel] parsed raw user data:', parsed);
      if (!parsed) {
        setError('User not found');
        setUser(null);
      } else {
        setUser(parsed);
      }
    } catch (err) {
      console.error('[useUserProfileViewModel] fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to load user';
      setError(message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateProfile = useCallback(async (updates: UpdateUserDto): Promise<User> => {
    try {
      setIsUpdating(true);
      setError(null);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')) : undefined;
      try {
        const resp = await usersAPI.updateMyProfile(updates as Record<string, unknown>, token || undefined, true);
        const payload = resp.data ?? null;
        const parsed = parseRawUser(payload, userId);
        if (parsed) {
          setUser(parsed);
          return parsed;
        }
      } catch (apiErr) {
        console.warn('usersAPI.updateMyProfile failed, falling back to usecase:', apiErr);
      }

      const updatedUser = await updateUserProfileUseCase.execute(userId, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [updateUserProfileUseCase, userId]);

  return {
    user,
    isLoading,
    error,
    isUpdating,
    updateProfile,
    refresh: fetchUser,
  };
};
