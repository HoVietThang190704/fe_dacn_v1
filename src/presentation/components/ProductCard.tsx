 'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Product } from '@/domain/entities/Product';

interface MockProduct extends Omit<Product, 'rating' | 'reviewCount' | 'description' | 'additionalImages' | 'brand' | 'origin'> {
  sold?: number;
}

const ProductCard: React.FC<{ product: MockProduct }> = ({ product }) => {
  const router = useRouter();
  const t = useTranslations('productCard');
  
  const handleClick = () => router.push(`/main/products/${product.id}`);

  // Prefer explicit owner info, fallback to localized label
  const sellerName = product.owner?.userName || product.owner?.email || t('seller');
  const soldCount = product.sold || 0;
  const stockCount = product.stock || 0;

  return (
    <div
      className="bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-100 rounded-lg overflow-hidden"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2.5">
        {/* Product name - larger and bolder */}
        <h3 className="text-sm sm:text-base mb-2 line-clamp-2 font-semibold text-gray-800 leading-tight" style={{ minHeight: '1rem' }}>
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-orange-500 text-base sm:text-lg font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Seller info - larger and more prominent */}
        <div className="text-sm text-gray-700 mb-1 truncate">
          <span className="font-semibold text-blue-700"></span> <span className="font-medium">{sellerName}</span>
        </div>

        {/* Stock and sold count - slightly larger */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span>{t('available')}: <span className="font-semibold text-green-600">{stockCount}</span></span>
          <span>{t('sold')}: <span className="font-semibold text-blue-600">{soldCount}</span></span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;