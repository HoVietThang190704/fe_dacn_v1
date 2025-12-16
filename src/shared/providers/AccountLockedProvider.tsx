'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api';
import { AccountLockedPopup } from '@/components/ui/AccountLockedPopup';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';

export function AccountLockedProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  const readLockedFromLocal = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return false;
      const parsed = JSON.parse(savedUser);
      return Boolean(parsed?.locked);
    } catch (e) {
      console.error('Failed to read locked from localStorage:', e);
      return false;
    }
  }, []);

  const extractLocked = useCallback((payload: unknown): boolean => {
    const seen = new WeakSet<object>();

    const walk = (value: unknown): boolean => {
      if (!value || typeof value !== 'object') return false;
      const obj = value as Record<string, unknown>;
      if (seen.has(obj)) return false;
      seen.add(obj);

      // Direct hit
      if (typeof obj.locked === 'boolean') return obj.locked;
      if (typeof obj.locked === 'string') {
        if (obj.locked.toLowerCase() === 'true') return true;
        if (obj.locked.toLowerCase() === 'false') return false;
      }

      // Common shapes
      if (obj.data) {
        const hit = walk(obj.data);
        if (hit !== false) return hit;
      }
      if (obj.user) {
        const hit = walk(obj.user);
        if (hit !== false) return hit;
      }

      // Scan other fields
      for (const key of Object.keys(obj)) {
        const v = obj[key];
        if (typeof v === 'object') {
          const hit = walk(v);
          if (hit !== false) return hit;
        }
      }

      return false;
    };

    return walk(payload);
  }, []);

  const checkAccountStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsLocked(false);
        setIsChecking(false);
        return;
      }

      // Fetch current profile to check locked status
      const profileResult = await usersAPI.getMyProfile(token);
      console.log('[AccountLocked] profileResult', profileResult);
      if (profileResult?.data) {
        try {
          console.log('[AccountLocked] profileResult.data json', JSON.stringify(profileResult.data));
        } catch {}
      }
      
      if (profileResult && profileResult.success && profileResult.data) {
        const lockedFromResponse = extractLocked(profileResult.data);
        console.log('[AccountLocked] extracted locked =', lockedFromResponse);

        const savedUser = localStorage.getItem('user');
        let lockedFromSaved = false;
        let savedEmail = '';
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            lockedFromSaved = Boolean(parsedUser?.locked);
            savedEmail = parsedUser?.email || '';
          } catch (e) {
            console.error('Failed to parse user in localStorage:', e);
          }
        }

        const finalLocked = lockedFromResponse || lockedFromSaved;
        console.log('[AccountLocked] finalLocked =', finalLocked, 'savedLocked=', lockedFromSaved, 'email=', savedEmail);
        setIsLocked(finalLocked);
        
        // Update localStorage user data with latest locked status
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            parsedUser.locked = finalLocked;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          } catch (e) {
            console.error('Failed to update user in localStorage:', e);
          }
        }
      } else {
        console.warn('[AccountLocked] profile request not successful, fallback local');
        setIsLocked(readLockedFromLocal());
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      setIsLocked(readLockedFromLocal());
    } finally {
      setIsChecking(false);
    }
  }, [extractLocked, readLockedFromLocal]);

  useEffect(() => {
    // Immediate local check to block UI quickly
    setIsLocked(readLockedFromLocal());

    // Initial check
    checkAccountStatus();

    // Listen to storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          checkAccountStatus();
        } else {
          setIsLocked(false);
        }
      }
      if (e.key === 'user') {
        try {
          const userData = e.newValue ? JSON.parse(e.newValue) : null;
          setIsLocked(Boolean(userData?.locked));
        } catch (e) {
          console.error('Failed to parse user from storage:', e);
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAccountStatus();
      }
    };

    const handleFocus = () => {
      checkAccountStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAccountStatus]);

  const handleLogout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear token from container
    postCommentContainer.setAuthToken('');
    
    setIsLocked(false);
    
    // Redirect to login
    router.push('/auth/login');
  }, [router]);

  // Don't block rendering while checking - just show popup when needed
  return (
    <>
      {children}
      <AccountLockedPopup 
        isOpen={isLocked && !isChecking} 
        onLogout={handleLogout} 
      />
    </>
  );
}

export default AccountLockedProvider;
