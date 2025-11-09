import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Product } from '@/domain/entities/Product';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

const ProductListCard: React.FC<{
  product: Product;
  router: { push: (path: string) => void };
  t: (key: string) => string;
}> = ({ product, router, t }) => {
  const tCard = useTranslations('productCard');
  
  const handleClick = () => {
    router.push(`/main/products/${product.id}`);
  };

  const priceLabel = product.price ? formatCurrency(product.price) : t('contact');
  const originalPriceLabel = product.originalPrice ? formatCurrency(product.originalPrice) : undefined;
  const soldCount = product.sold ?? 0;
  const stockCount = product.stock ?? 0;
  const thumbnail = product.image || product.images?.[0];
  
  // Use product owner display name when available
  const sellerName = product.owner?.userName || product.owner?.email || tCard('seller');

  return (
    <div className="bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-100 rounded-lg overflow-hidden" onClick={handleClick}>
      <div className="relative aspect-square">
        <Image
          src={thumbnail}
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

      <div className="p-2.5">
        {/* Product name - larger and bolder */}
        <h3 className="text-sm sm:text-base mb-2 line-clamp-2 font-semibold text-gray-800 leading-tight" style={{ minHeight: '1rem' }}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-orange-500 text-base sm:text-lg font-bold">
            {priceLabel}
          </span>
          {originalPriceLabel && (
            <span className="text-gray-400 text-xs line-through">
              {originalPriceLabel}
            </span>
          )}
        </div>

        {/* Seller info - larger and more prominent */}
        <div className="text-sm text-gray-700 mb-1.5 truncate">
          <span className="font-semibold text-blue-700"></span> <span className="font-medium">{sellerName}</span>
        </div>

        {/* Stock and sold count - slightly larger */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span>{tCard('available')}: <span className="font-semibold text-green-600">{stockCount}</span></span>
          <span>{tCard('sold')}: <span className="font-semibold text-blue-600">{soldCount}</span></span>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;