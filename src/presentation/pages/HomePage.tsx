/**
 * Presentation Layer: Home Page
 * Pure UI component that receives data from ViewModel
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { HeroBanner } from '@/components/ui/HeroBanner';
import CategoriesCarousel from '@/components/home/CategoriesCarousel';
import ProductCard from '../components/ProductCard';

export const HomePage: React.FC = () => {
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
      <CategoriesCarousel categories={data.categories} />
      <div className="bg-white shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-orange-500 flex items-center gap-2">
            <Image src={ICONS.GOODS} alt="flash" width={18} height={18} className="w-4 h-4" />
            <span>{t('flashSale')}</span>
          </h2>
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
            <ProductCard key={product.id} product={product} />
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
