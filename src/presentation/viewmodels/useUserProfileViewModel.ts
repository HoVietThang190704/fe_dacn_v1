"use client";

import { useState, useEffect, useCallback } from 'react';
import { UpdateUserProfileUseCase } from '@/domain/usecases/UpdateUserProfileUseCase';
import { GetUserProfileUseCase } from '@/domain/usecases/GetUserProfileUseCase';
import { UploadUserAvatarUseCase } from '@/domain/usecases/UploadUserAvatarUseCase';
import { User, UpdateUserDto, UserAddress } from '@/domain/entities/User';

export const useUserProfileViewModel = (
  getUserProfileUseCase: GetUserProfileUseCase,
  updateUserProfileUseCase: UpdateUserProfileUseCase,
  uploadUserAvatarUseCase: UploadUserAvatarUseCase,
  userId: string
) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = await getUserProfileUseCase.execute(userId);
      setUser(profile);
    } catch (err) {
      console.error('[useUserProfileViewModel] fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getUserProfileUseCase, userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateProfile = useCallback(async (updates: UpdateUserDto): Promise<User> => {
    try {
      setIsUpdating(true);
      setError(null);
      const normalizedUpdates = normalizeUpdates(updates);
      const updatedUser = await updateUserProfileUseCase.execute(userId, normalizedUpdates);
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

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      return await uploadUserAvatarUseCase.execute(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [uploadUserAvatarUseCase]);

  return {
    user,
    isLoading,
    error,
    isUpdating,
    updateProfile,
    uploadAvatar,
    refresh: fetchUser,
  };
};

const normalizeUpdates = (updates: UpdateUserDto): UpdateUserDto => {
  const payload: UpdateUserDto = {};

  if (updates.userName !== undefined) {
    const trimmed = updates.userName.trim();
    if (trimmed) {
      payload.userName = trimmed;
    }
  }

  if (updates.phone !== undefined) {
    const trimmed = updates.phone.trim();
    if (trimmed) {
      payload.phone = trimmed;
    }
  }

  if (updates.dateOfBirth !== undefined) {
    payload.dateOfBirth = updates.dateOfBirth
      ? new Date(updates.dateOfBirth).toISOString()
      : null;
  }

  if (updates.avatar !== undefined) {
    payload.avatar = updates.avatar;
  }

  if (updates.address !== undefined) {
    payload.address = normalizeAddress(updates.address);
  }

  return payload;
};

const normalizeAddress = (address: UpdateUserDto['address']): UserAddress | null | undefined => {
  if (address === null) {
    return null;
  }

  if (!address || typeof address !== 'object') {
    return null;
  }

  const sanitized: UserAddress = {
    province: sanitizeAddressField(address.province),
    district: sanitizeAddressField(address.district),
    commune: sanitizeAddressField(address.commune),
    street: sanitizeAddressField(address.street),
    detail: sanitizeAddressField(address.detail),
  };

  const hasValue = Object.values(sanitized).some(Boolean);
  return hasValue ? sanitized : null;
};

const sanitizeAddressField = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};
