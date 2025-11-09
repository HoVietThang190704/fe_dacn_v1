import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Favorite } from '@/domain/entities/Favorite';

type FavoriteCardProps = {
  favorite: Favorite;
  onRemove?: () => void;
  isMutating?: boolean;
};

const FavoriteCard: React.FC<FavoriteCardProps> = ({ favorite, onRemove, isMutating }) => {
  const t = useTranslations('favorites');
  const product = favorite.product;
  const productId = product?.id || favorite.productId;
  const fallbackName = product?.name || t('discover');
  const imageSrc = product?.image || product?.images?.[0] || 'https://placehold.co/400x400?text=No+Image';
  const price = product?.price;
  const originalPrice = product?.originalPrice;
  const discount = product?.discount;
  const stockQuantity = product?.stock ?? product?.stockQuantity;
  const isInStock = product?.inStock ?? (typeof stockQuantity === 'number' ? stockQuantity > 0 : true);
  const productLink = productId ? `/main/products/${productId}` : '#';

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!isMutating && onRemove) {
      onRemove();
    }
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };


  return (
    <div className="bg-white hover:shadow-md transition-shadow relative rounded-lg border border-gray-100 overflow-hidden">
      <button
        type="button"
        aria-label={t('removeAria')}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-60"
        onClick={handleRemove}
        disabled={isMutating || !onRemove}
      >
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <Link
        href={productLink}
        className={`block ${productLink === '#' ? 'pointer-events-none opacity-60' : ''}`}
        aria-disabled={productLink === '#'}
        onClick={(event) => {
          if (productLink === '#') {
            event.preventDefault();
          }
        }}
      >
        <div className="relative aspect-square">
          <Image
            src={imageSrc}
            alt={product?.name || favorite.productId}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
          {discount && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5">
              {discount}% GIẢM
            </div>
          )}
          {!isInStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-xs font-medium">{t('outOfStock')}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-2">
        <Link
          href={productLink}
          className={`block ${productLink === '#' ? 'pointer-events-none opacity-60' : ''}`}
          aria-disabled={productLink === '#'}
          onClick={(event) => {
            if (productLink === '#') {
              event.preventDefault();
            }
          }}
        >
          <h3 className="text-xs sm:text-sm mb-1 line-clamp-2 h-8 sm:h-10">{fallbackName}</h3>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-orange-500 text-sm sm:text-base font-medium">
              {formatCurrency(price)}
            </span>
            {typeof originalPrice === 'number' && (
              <span className="text-gray-400 text-xs line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            // TODO: integrate add to cart
          }}
          disabled={!isInStock}
          className={`w-full mt-2 py-1.5 text-xs rounded transition-colors ${isInStock ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {isInStock ? t('addToCart') : t('outOfStock')}
        </button>
      </div>
    </div>
  );
};

export default FavoriteCard;