import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

const StarIcon = () => (
  <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

interface ProductOwnerSummary {
  id: string;
  userName?: string;
  email?: string;
  avatar?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  sold?: number;
  stock?: number;
  seller?: string;
  owner?: ProductOwnerSummary;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, price, originalPrice, discount, image, images, rating, reviewCount, sold, stock, seller, owner } = product;
  const t = useTranslations('productCard');
  const productT = useTranslations('product');
  
  const sellerName = owner?.userName || owner?.email || seller || t('unknownSeller');
  const stockCount = stock || 0;
  const displayImage = image || images?.[0] || ICONS.GOODS;
  const ratingValue = typeof rating === 'number' ? rating : 0;
  const reviewTotal = typeof reviewCount === 'number' ? reviewCount : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight" style={{ minHeight: '2.5rem' }}>
          {name}
        </h3>
        <div className="text-sm text-gray-700 mb-2 truncate">
          <span className="font-semibold text-blue-700">{t('seller')}:</span> <span className="font-medium">{sellerName}</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <StarIcon />
            <span className="text-sm font-medium text-gray-700 ml-1">{ratingValue.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-600">{reviewTotal} {productT('reviews')}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-red-600">
              ₫{price.toLocaleString('vi-VN')}
            </span>
            {originalPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₫{originalPrice.toLocaleString('vi-VN')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>{t('available')}: <span className="font-semibold text-green-600">{stockCount}</span></span>
          <span>{t('sold')}: <span className="font-semibold text-blue-600">{sold ?? 0}</span></span>
        </div>
      </div>
    </div>
  );
}
