import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ICONS } from '@/shared/constants/images';
import { Favorite } from '@/domain/entities/Favorite';

type FavoriteCardProps = {
  favorite: Favorite;
  onRemove?: () => void;
  isMutating?: boolean;
};

const FavoriteCard: React.FC<FavoriteCardProps> = ({ favorite, onRemove, isMutating }) => {
  const t = useTranslations('favorites');
  const tProductCard = useTranslations('productCard');
  const product = favorite.product;
  const productId = product?.id || favorite.productId;
  const fallbackName = product?.name || t('discover');
  const imageSrc = product?.image || product?.images?.[0] || '';
  const price = product?.price;
  const originalPrice = product?.originalPrice;
  const discount = product?.discount;
  const stockQuantity = product?.stock ?? product?.stockQuantity;
  const isInStock = product?.inStock ?? (typeof stockQuantity === 'number' ? stockQuantity > 0 : true);
  const productLink = productId ? `/main/products/${productId}` : '#';

  const sellerName = product?.owner?.userName || product?.owner?.email;

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
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/50 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-60"
        onClick={handleRemove}
        disabled={isMutating || !onRemove}
      >
        <Image
          src={ICONS.CROSS}
          alt={String(t('removeAria'))}
          width={12}
          height={12}
          className="w-3 h-3 text-red-500"
        />
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
            <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 flex items-center gap-1">
              <Image src={ICONS.THUNDER} alt={String(tProductCard('discountLabel', { discount }))} width={14} height={14} className="w-3 h-3" />
              <span>{tProductCard('discountLabel', { discount })}</span>
            </div>
          )}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/40 bg-opacity-60 flex items-center justify-center">
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
          <h3 className="text-xs sm:text-sm  line-clamp-2 h-4 sm:h-6">{fallbackName}</h3>
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
          {sellerName && (
            <p className="text-xs text-gray-500 mb-1">
               {sellerName}
            </p>
          )}
        </Link>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            // remove from favorites or add to cart behavior to be implemented by parent
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