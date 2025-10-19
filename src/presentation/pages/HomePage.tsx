/**
 * Presentation Layer: Home Page
 * Pure UI component that receives data from ViewModel
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { container } from '../di/container';
import { Banner, Promotion } from '@/domain/entities/Banner';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Product, ProductCategory } from '@/domain/entities/Product';

interface HomePageProps {
  locale: string;
}

export const HomePage: React.FC<HomePageProps> = ({ locale }) => {
  const t = useTranslations('home');
  // Mock data for UI preview
  const data = {
    categories: [
      {
        id: 'c1',
        name: 'Rau củ',
        icon: 'https://cdn-icons-png.flaticon.com/512/2909/2909763.png',
        slug: 'rau-cu'
      },
      {
        id: 'c2',
        name: 'Trái cây',
        icon: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png',
        slug: 'trai-cay'
      }
    ],
    promotions: [
      {
        id: 'p1',
        title: 'Ưu đãi đầu tuần',
        discount: 20,
        description: 'Giảm giá 20% cho đơn hàng đầu tiên!',
        backgroundColor: '#34d399',
        validFrom: new Date(),
        validTo: new Date(),
      }
    ],
    bestSellingProducts: [
      {
        id: 'pr1',
        name: 'Cà chua Đà Lạt',
        image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
        unit: 'kg',
        price: 2.5,
        originalPrice: 3.0,
        category: 'rau-cu',
        stock: 100
      }
    ],
    newProducts: [
      {
        id: 'pr2',
        name: 'Dưa hấu Mỹ',
        image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
        unit: 'kg',
        price: 4.0,
        originalPrice: 4.5,
        category: 'trai-cay',
        stock: 50
      }
    ]
  };

  // ...existing code...

  // Commented out logic that blocks UI when data is missing
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-xl">Loading...</div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen">
  //       <div className="text-xl text-red-500 mb-4">{error}</div>
  //       <button
  //         onClick={refresh}
  //         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
  //       >
  //         Retry
  //       </button>
  //     </div>
  //   );
  // }

  // if (!data) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroBanner onShopNowClick={() => window.location.href = '/main/products'} />
      <div className="bg-white shadow-sm p-3 mb-3">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {data.categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center min-w-[70px] cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-1">
                <span className="text-2xl">🥬</span>
              </div>
              <span className="text-xs text-center">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-orange-500">⚡ {t('flashSale')}</h2>
          <div className="flex gap-1 text-sm">
            <span className="bg-black text-white px-2 py-1 rounded">12</span>
            <span>:</span>
            <span className="bg-black text-white px-2 py-1 rounded">34</span>
            <span>:</span>
            <span className="bg-black text-white px-2 py-1 rounded">56</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {data.bestSellingProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
      <div className="bg-white shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">{t('suggestions')}</h2>
          <a href="#" className="text-orange-500 text-sm hover:underline">{t('seeAll')}</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {[...data.bestSellingProducts, ...data.newProducts].map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </div>
  );
};
const HeroBannerSection: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  if (!banners.length) return null;

  const mainBanner = banners[0];

  return (
    <section className="bg-green-700 text-white p-8 rounded-lg mb-8">
      <div className="flex items-center justify-between">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-4">{mainBanner.title}</h1>
          <p className="text-lg mb-6">{mainBanner.description}</p>
          <button className="px-6 py-3 bg-lime-400 text-green-900 font-semibold rounded-lg hover:bg-lime-300">
            {mainBanner.ctaText}
          </button>
        </div>
        <div className="w-96 h-64">
          <img
            src={mainBanner.image}
            alt={mainBanner.title}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};

const CategoriesSection: React.FC<{ categories: ProductCategory[] }> = ({ categories }) => {
  return (
    <section className="mb-8">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center min-w-[100px] cursor-pointer hover:opacity-80"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
              <img src={category.icon} alt={category.name} className="w-10 h-10" />
            </div>
            <span className="text-sm text-gray-700">{category.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const PromotionsSection: React.FC<{ promotions: Promotion[] }> = ({ promotions }) => {
  if (!promotions.length) return null;

  return (
    <section className="grid grid-cols-4 gap-4 mb-8">
      {promotions.map((promo) => (
        <div
          key={promo.id}
          className="p-4 rounded-lg text-white"
          style={{ backgroundColor: promo.backgroundColor }}
        >
          <div className="text-2xl font-bold mb-1">
            Save {promo.discount}%
          </div>
          <div className="text-sm">{promo.description}</div>
        </div>
      ))}
    </section>
  );
};

const ProductSection: React.FC<{ title: string; products: Product[] }> = ({
  title,
  products,
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <a href="#" className="text-green-600 hover:underline">
          See more →
        </a>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
      <div className="relative aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <h3 className="text-xs sm:text-sm mb-1 line-clamp-2 h-8">{product.name}</h3>
        
        <div className="flex items-center gap-1">
          <span className="text-orange-500 text-sm font-medium">
            ₫{(product.price * 20000).toLocaleString('vi-VN')}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              ₫{(product.originalPrice * 20000).toLocaleString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
