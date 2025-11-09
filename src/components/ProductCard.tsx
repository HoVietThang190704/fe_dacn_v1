import Image from 'next/image';
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
  const displayImage = image || images?.[0] || 'https://placehold.co/400x400?text=Product';
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
        {/* Product name - larger and bolder */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight" style={{ minHeight: '2.5rem' }}>
          {name}
        </h3>
        
        {/* Seller info - larger and more prominent */}
        <div className="text-sm text-gray-700 mb-2 truncate">
          <span className="font-semibold text-blue-700">{t('seller')}:</span> <span className="font-medium">{sellerName}</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <StarIcon />
            <span className="text-sm font-medium text-gray-700 ml-1">{ratingValue.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-600">{reviewTotal} {productT('reviews')}</span>
        </div>
        
        {/* Price - larger and bolder */}
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
        
        {/* Stock and sold count - slightly larger */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>{t('available')}: <span className="font-semibold text-green-600">{stockCount}</span></span>
          <span>{t('sold')}: <span className="font-semibold text-blue-600">{sold ?? 0}</span></span>
        </div>
      </div>
    </div>
  );
}

// Dữ liệu demo
export const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Áo thun nam cổ tròn chất liệu cotton cao cấp',
    price: 150000,
    originalPrice: 200000,
    discount: 25,
    image: '/img/products/ao-thun-1.jpg',
    rating: 4.5,
    reviewCount: 120,
    sold: 450,
    stock: 85,
    owner: {
      id: 'owner-1',
      userName: 'Shop Thời Trang ABC',
    },
  },
  {
    id: '2',
    name: 'Giày sneaker nam nữ thời trang thể thao',
    price: 350000,
    originalPrice: 500000,
    discount: 30,
    image: '/img/products/giay-sneaker-1.jpg',
    rating: 4.8,
    reviewCount: 89,
    sold: 320,
    stock: 45,
    owner: {
      id: 'owner-2',
      userName: 'Giày Việt Store',
    },
  },
  {
    id: '3',
    name: 'Điện thoại iPhone 14 Pro Max 128GB',
    price: 25000000,
    originalPrice: 28000000,
    discount: 11,
    image: '/img/products/iphone-14.jpg',
    rating: 4.9,
    reviewCount: 567,
    sold: 1234,
    stock: 12,
    owner: {
      id: 'owner-3',
      userName: 'Mobile World',
    },
  },
  {
    id: '4',
    name: 'Túi xách nữ da thật cao cấp',
    price: 800000,
    originalPrice: 1200000,
    discount: 33,
    image: '/img/products/tui-xach-1.jpg',
    rating: 4.7,
    reviewCount: 234,
    sold: 678,
    stock: 28,
    owner: {
      id: 'owner-4',
      userName: 'Fashion Luxury',
    },
  },
  {
    id: '5',
    name: 'Máy lọc không khí Xiaomi Mi Air Purifier 3H',
    price: 2200000,
    originalPrice: 2500000,
    discount: 12,
    image: '/img/products/may-loc-khong-khi.jpg',
    rating: 4.6,
    reviewCount: 145,
    sold: 290,
    stock: 35,
    owner: {
      id: 'owner-5',
      userName: 'Điện Máy Xanh',
    },
  },
  {
    id: '6',
    name: 'Balo laptop chống nước đa năng',
    price: 280000,
    originalPrice: 350000,
    discount: 20,
    image: '/img/products/balo-laptop.jpg',
    rating: 4.4,
    reviewCount: 78,
    sold: 156,
    stock: 67,
    owner: {
      id: 'owner-6',
      userName: 'Balo Pro Store',
    },
  },
];