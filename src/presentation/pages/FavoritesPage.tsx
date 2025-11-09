/**
 * Presentation Layer: Favorites Page
 * Pure UI component for favorites/wishlist
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import FavoriteCard from '../components/FavoriteCard';
import { container } from '@/presentation/di/container';
import { useFavoritesViewModel } from '@/presentation/viewmodels/useFavoritesViewModel';

interface FavoritesPageProps {
  userId: string;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ userId }) => {
  const t = useTranslations('favorites');
  const router = useRouter();
  const viewModel = useFavoritesViewModel(
    {
      getFavoritesUseCase: container.getFavoritesUseCase,
      removeFavoriteUseCase: container.removeFavoriteUseCase,
      toggleFavoriteUseCase: container.toggleFavoriteUseCase,
    },
    userId
  );

  if (viewModel.isLoading) {
    return <LoadingState message={t('loading')} />;
  }

  if (viewModel.error) {
    return <ErrorState message={viewModel.error} onRetry={viewModel.refresh} retryLabel={t('retry')} />;
  }

  if (viewModel.favorites.length === 0) {
    return <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} actionLabel={t('discover')} onAction={() => router.push('/main/products')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title', { count: viewModel.favorites.length })}</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {viewModel.favorites.map((favorite) => (
          <FavoriteCard
            key={`${favorite.productId}-${favorite.id}`}
            favorite={favorite}
            onRemove={() => viewModel.removeFavorite(favorite.productId)}
            isMutating={viewModel.isMutating}
          />
        ))}
      </div>
    </div>
  );
};

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-3">
      <div className="mx-auto h-14 w-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" aria-hidden />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void; retryLabel: string }> = ({ message, onRetry, retryLabel }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="bg-white shadow-lg rounded-2xl px-8 py-10 text-center max-w-md space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-500 flex items-center justify-center text-2xl" aria-hidden>
        !
      </div>
      <p className="text-base font-semibold text-gray-900">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
        {retryLabel}
      </button>
    </div>
  </div>
);

const EmptyState: React.FC<{ title: string; description: string; actionLabel: string; onAction: () => void }> = ({ title, description, actionLabel, onAction }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white shadow-lg rounded-3xl px-8 py-10 text-center max-w-md space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl" aria-hidden>
        ♥
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <button onClick={onAction} className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition">
        {actionLabel}
      </button>
    </div>
  </div>
);
