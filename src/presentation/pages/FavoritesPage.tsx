'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FavoriteCard from '../components/FavoriteCard';
import useFavoritesPage from '@/presentation/hooks/useFavoritesPage';
import { useCartContext } from '@/shared/providers/CartProvider';
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
  const cart = useCartContext();
  const tCart = useTranslations('cart');
  const translate = tCart as unknown as (key: string, values?: Record<string, unknown>) => string;
  const actionMessage = cart.lastActionMessage ? translate(`messages.${cart.lastActionMessage}`) : null;

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
      {actionMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {actionMessage}
        </div>
      )}

      <div className={FAVORITES_GRID_CLASSES}>
        {viewModel.favorites.map((favorite) => {
          const productId = favorite.product?.id || favorite.productId;
          const isAddingThis = cart.isMutating && cart.pendingItemId === productId;

          return (
            <FavoriteCard
              key={`${favorite.productId}-${favorite.id}`}
              favorite={favorite}
              onRemove={() => viewModel.removeFavorite(favorite.productId)}
              isMutating={viewModel.isMutating}
              isAdding={isAddingThis}
              onAddToCart={async (productId: string) => {
                if (cart.isMutating) return;
                const product = favorite.product;
                try {
                  await cart.addItem({
                    productId,
                    shopId: product?.owner?.id,
                    quantity: 1,
                    price: product?.price,
                    title: product?.name,
                    thumbnail: product?.image || product?.images?.[0],
                  });
                } catch (err) {
                  // cart.addItem handles errors and sets error state; log for debugging
                  console.error('Error adding favorite product to cart:', err);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};


