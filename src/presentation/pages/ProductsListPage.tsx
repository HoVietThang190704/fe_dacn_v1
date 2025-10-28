
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SortDropdown from '../components/SortDropdown';
import { useProductsListViewModel } from '../viewmodels/useProductsListViewModel';
import { container } from '../di/container';
import { Product, ProductCategory } from '@/domain/entities/Product';

interface MockProduct extends Omit<Product, 'rating' | 'reviewCount' | 'description' | 'additionalImages' | 'brand' | 'origin'> {
  sold?: number;
}

interface ProductsListPageProps {
  categories: ProductCategory[];
}

export const ProductsListPage: React.FC<ProductsListPageProps> = ({ categories }) => {
  const t = useTranslations('products');
  const router = useRouter();
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useProductsListViewModel(container.getProductsUseCase, categories);
  // if (viewModel.isLoading) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }

  // Mock data for UI preview - Shopee style
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'none' | 'low-high' | 'high-low'>('none');
  const mockProducts: MockProduct[] = [
    {
      id: 'p1',
      name: 'Táo Envy New Zealand cao cấp - Hộp 1kg',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      price: 85000,
      originalPrice: 120000,
      discount: 29,
      unit: 'hộp',
      category: 'fruits',
      stock: 50,
      sold: 1234,
    },
    {
      id: 'p2',
      name: 'Cam sành Cao Phong ngọt thanh - Túi 1kg',
      image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80',
      price: 39000,
      originalPrice: 55000,
      discount: 29,
      unit: 'túi',
      category: 'fruits',
      stock: 100,
      sold: 2341,
    },
    {
      id: 'p3',
      name: 'Nho xanh không hạt Úc nhập khẩu - Hộp 500g',
      image: 'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=400&q=80',
      price: 110000,
      originalPrice: 150000,
      discount: 27,
      unit: 'hộp',
      category: 'fruits',
      stock: 30,
      sold: 891,
    },
    {
      id: 'p4',
      name: 'Dưa hấu không hạt Mỹ siêu ngọt - Trái 3-4kg',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784l66?auto=format&fit=crop&w=400&q=80',
      price: 45000,
      originalPrice: 60000,
      discount: 25,
      unit: 'kg',
      category: 'fruits',
      stock: 80,
      sold: 3456,
    },
    {
      id: 'p5',
      name: 'Cà chua cherry Đà Lạt tươi ngon - Hộp 250g',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80',
      price: 28000,
      originalPrice: 35000,
      discount: 20,
      unit: 'hộp',
      category: 'vegetables',
      stock: 120,
      sold: 5678,
    },
    {
      id: 'p6',
      name: 'Dâu tây Đà Lạt hữu cơ an toàn - Hộp 250g',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
      price: 95000,
      originalPrice: 120000,
      discount: 21,
      unit: 'hộp',
      category: 'fruits',
      stock: 45,
      sold: 782,
    },
  ];

  const filteredProducts = selectedCategory === '' 
    ? mockProducts 
    : mockProducts.filter(p => p.category === selectedCategory);

  const displayedProducts = React.useMemo(() => {
    if (sortBy === 'low-high') return [...filteredProducts].sort((a, b) => a.price - b.price);
    if (sortBy === 'high-low') return [...filteredProducts].sort((a, b) => b.price - a.price);
    return filteredProducts;
  }, [filteredProducts, sortBy]);

  return (
    <div className="  bg-gray-50 p-3 sm:p-4 md:p-4">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-sm text-gray-600 mt-1">{t('found', { count: filteredProducts.length })}</p>
      </div>
      <div className="bg-white shadow-sm p-3 mb-3 flex items-center justify-between text-sm">
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600">
            {t('popular')}
          </button>
          <button className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50">
            {t('newest')}
          </button>
          <button className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50">
            {t('bestSellers')}
          </button>
          <SortDropdown
            value={t('sort')}
            options={[
              { value: 'low-high', label: t('sortLowHigh') },
              { value: 'high-low', label: t('sortHighLow') },
            ]}
            align="right"
            onChange={(v) => setSortBy(v as 'none' | 'low-high' | 'high-low')}
          />
        </div>
      </div>
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 overflow-hidden">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} router={router} t={t} />
          ))}
        </div>
      ) : (
        <EmptyState t={t} />
      )}
    </div>
  );
};

const ProductCard: React.FC<{ 
  product: MockProduct; 
  router: { push: (path: string) => void };
  t: (key: string) => string;
}> = ({ product, router, t }) => {
  const handleClick = () => {
    router.push(`/main/products/${product.id}`);
  };

  return (
    <div className="bg-white hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
        {product.discount && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5">
            {product.discount}% GIẢM
          </div>
        )}
      </div>


      <div className="p-2">
        <h3 className="text-xs sm:text-sm mb-1 line-clamp-2 h-8 sm:h-10">{product.name}</h3>
        
        <div className="flex items-center gap-1 mb-1">
          <span className="text-orange-500 text-sm sm:text-base font-medium">
            ₫{product.price.toLocaleString('vi-VN')}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              {product.originalPrice.toLocaleString('vi-VN')}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {t('sold')} {product.sold || 0}
        </div>
      </div>
    </div>
  );
};

const LoadingState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{t('loading')}</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: (key: string) => string }> = ({ error, onRetry, t }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        {t('retry')}
      </button>
    </div>
  </div>
);

const EmptyState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="text-center py-12">
    <div className="text-gray-400 text-6xl mb-4">📦</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('emptyTitle')}</h3>
    <p className="text-gray-500">{t('emptyDesc')}</p>
  </div>
);
