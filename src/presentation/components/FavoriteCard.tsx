import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

interface MockFavorite {
  id: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    stock: boolean;
  };
}

const FavoriteCard: React.FC<{ favorite: MockFavorite }> = ({ favorite }) => {
  const { product } = favorite;
  const t = useTranslations('favorites');

  return (
    <div className="bg-white hover:shadow-md transition-shadow relative">
      <button className="absolute top-1 right-1 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors" onClick={(e) => { e.stopPropagation(); /* TODO: remove from favorites */ }}>
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <Link href={`/main/products/${product.id}`} className="block">
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
          {!product.stock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Hết hàng</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-2">
        <Link href={`/main/products/${product.id}`} className="block">
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
        </Link>
        <button onClick={(e) => { e.stopPropagation(); /* TODO: add to cart action */ }} disabled={!product.stock} className={`w-full mt-2 py-1.5 text-xs rounded transition-colors ${product.stock ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{product.stock ? t('addToCart') : t('outOfStock')}</button>
      </div>
    </div>
  );
};

export default FavoriteCard;