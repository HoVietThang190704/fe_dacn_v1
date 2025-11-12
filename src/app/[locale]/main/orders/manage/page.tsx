'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ManagedOrdersPage } from '@/presentation/pages';
import { useAuth } from '@/shared/hooks/useAuth';

const ALLOWED_ROLES = new Set(['shop_owner', 'admin']);

export default function ManageShopOrdersRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user && !ALLOWED_ROLES.has(user.role)) {
      router.replace('/main');
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !ALLOWED_ROLES.has(user.role)) {
    return null;
  }

  return <ManagedOrdersPage />;
}
