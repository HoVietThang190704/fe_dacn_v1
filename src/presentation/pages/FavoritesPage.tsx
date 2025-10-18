/**
 * Presentation Layer: Favorites Page
 * Pure UI component for favorites/wishlist
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useFavoritesViewModel } from '../viewmodels/useFavoritesViewModel';
import { container } from '../di/container';
import { Favorite } from '@/domain/entities/Favorite';

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
      {/* Header - Shopee style */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title', { count: mockFavorites.length })}</h1>
      </div>

      {/* Favorites Grid - Responsive Shopee style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {mockFavorites.map((favorite) => (
          <FavoriteCard key={favorite.id} favorite={favorite as any} />
        ))}
      </div>
    </div>
  );
};

// Sub-components - Shopee style
const FavoriteCard: React.FC<{ favorite: Favorite }> = ({ favorite }) => {
  const { product } = favorite;
  const t = useTranslations('favorites');

  return (
    <div className="bg-white hover:shadow-md transition-shadow relative cursor-pointer">
      {/* Remove Button - Shopee style */}
      <button className="absolute top-1 right-1 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors">
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Product Image */}
      <div className="relative aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.discount && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5">
            {product.discount}% GIẢM
          </div>
        )}
        {!product.stock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-xs font-medium">Hết hàng</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2">
        <h3 className="text-xs sm:text-sm mb-1 line-clamp-2 h-8 sm:h-10">{product.name}</h3>
        
        <div className="flex items-center gap-1 mb-1">
          <span className="text-orange-500 text-sm sm:text-base font-medium">
            ₫{product.price.toLocaleString('vi-VN')}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              ₫{product.originalPrice.toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        {/* Add to cart button - Shopee style */}
        <button disabled={!product.stock} className={`w-full mt-2 py-1.5 text-xs rounded transition-colors ${product.stock ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{product.stock ? t('addToCart') : t('outOfStock')}</button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải sản phẩm yêu thích...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="text-gray-400 text-6xl mb-4">💚</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h3>
    <p className="text-gray-500 mb-6">
      Hãy thêm sản phẩm yêu thích để dễ dàng mua sắm sau này!
    </p>
    <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
      Khám phá sản phẩm
    </button>
  </div>
);
