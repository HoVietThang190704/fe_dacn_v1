'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProfilePage } from '@/presentation/pages/ProfilePage';
import { useProfileViewModel } from '@/presentation/viewmodels/useProfileViewModel';
import { container } from '@/presentation/di/container';

export default function ProfileRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const { profile, isLoading: isProfileLoading } = useProfileViewModel(container.getUserProfileUseCase);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return <ProfilePage profile={profile} />;
}
