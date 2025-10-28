/**
 * Presentation Layer: Favorites Page
 * Pure UI component for favorites/wishlist
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FavoriteCard from '../components/FavoriteCard';

interface FavoritesPageProps {
  userId: string;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ userId }) => {
  const t = useTranslations('favorites');
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useFavoritesViewModel(container.getFavoritesUseCase, userId);
  // if (viewModel.isLoading) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }

  // Mock data for UI preview - Shopee style
  const mockFavorites = [
    {
      id: '1',
      userId: userId,
      productId: 'p1',
      addedAt: new Date(),
      product: {
        id: 'p1',
        name: 'Táo Envy New Zealand - Hộp 1kg',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
        price: 85000,
        originalPrice: 120000,
        discount: 29,
        unit: 'hộp',
        stock: true,
      },
    },
    {
      id: '2',
      userId: userId,
      productId: 'p2',
      addedAt: new Date(Date.now() - 86400000),
      product: {
        id: 'p2',
        name: 'Cam Úc nhập khẩu - Túi 1kg',
        image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80',
        price: 65000,
        originalPrice: 85000,
        discount: 24,
        unit: 'túi',
        stock: true,
      },
    },
    {
      id: '3',
      userId: userId,
      productId: 'p3',
      addedAt: new Date(Date.now() - 172800000),
      product: {
        id: 'p3',
        name: 'Nho xanh không hạt Úc - Hộp 500g',
        image: 'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=400&q=80',
        price: 110000,
        originalPrice: 150000,
        discount: 27,
        unit: 'hộp',
        stock: false,
      },
    },
    {
      id: '4',
      userId: userId,
      productId: 'p4',
      addedAt: new Date(Date.now() - 259200000),
      product: {
        id: 'p4',
        name: 'Dưa hấu không hạt Mỹ - Trái 3-4kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784l66?auto=format&fit=crop&w=400&q=80',
        price: 45000,
        originalPrice: 60000,
        discount: 25,
        unit: 'kg',
        stock: true,
      },
    },
    {
      id: '5',
      userId: userId,
      productId: 'p5',
      addedAt: new Date(Date.now() - 345600000),
      product: {
        id: 'p5',
        name: 'Cà chua cherry Đà Lạt - Hộp 250g',
        image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80',
        price: 28000,
        originalPrice: 35000,
        discount: 20,
        unit: 'hộp',
        stock: true,
      },
    },
    {
      id: '6',
      userId: userId,
      productId: 'p6',
      addedAt: new Date(Date.now() - 432000000),
      product: {
        id: 'p6',
        name: 'Dâu tây Đà Lạt hữu cơ - Hộp 250g',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
        price: 95000,
        originalPrice: 120000,
        discount: 21,
        unit: 'hộp',
        stock: true,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title', { count: mockFavorites.length })}</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {mockFavorites.map((favorite) => (
          <FavoriteCard key={favorite.id} favorite={favorite} />
        ))}
      </div>
    </div>
  );
};
