'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FavoriteCard from '../components/FavoriteCard';
import useFavoritesPage from '@/presentation/hooks/useFavoritesPage';
import { FAVORITES_GRID_CLASSES } from '@/presentation/config/favoritesConfig';
import LoadingState from '@/presentation/components/ui/LoadingState';
import ErrorState from '@/presentation/components/ui/ErrorState';
import EmptyState from '@/presentation/components/ui/EmptyState';

interface FavoritesPageProps {
  userId: string;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ userId }) => {
  const t = useTranslations('favorites');
  const { viewModel, goToDiscover } = useFavoritesPage(userId);

  if (viewModel.isLoading) {
    return <LoadingState message={t('loading')} />;
  }

  if (viewModel.error) {
    return <ErrorState message={viewModel.error} onRetry={viewModel.refresh} retryLabel={t('retry')} />;
  }

  if (viewModel.favorites.length === 0) {
    return <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} actionLabel={t('discover')} onAction={goToDiscover} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title', { count: viewModel.favorites.length })}</h1>
      </div>
      <div className={FAVORITES_GRID_CLASSES}>
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


