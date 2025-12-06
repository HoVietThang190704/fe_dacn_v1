'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import RegisterShopOwnerPage from '@/presentation/pages/RegisterShopOwnerPage';
import { useProfileViewModel } from '@/presentation/viewmodels/useProfileViewModel';
import { container } from '@/presentation/di/container';

export default function RegisterShopOwnerRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { profile, isLoading: isProfileLoading } = useProfileViewModel(container.getUserProfileUseCase);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isProfileLoading && profile && profile.role !== 'customer') {
      router.replace('/main/profile');
    }
  }, [profile, isProfileLoading, router]);

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'customer') {
    return null;
  }

  return <RegisterShopOwnerPage profile={profile} />;
}
