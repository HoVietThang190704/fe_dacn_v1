import Image from 'next/image';

const StarIcon = () => (
  <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, price, originalPrice, discount, image, rating, reviews, sold } = product;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={image}
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
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <StarIcon />
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
          </div>
          <span className="text-sm text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-600">{reviews} đánh giá</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-600">
              ₫{price.toLocaleString('vi-VN')}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₫{originalPrice.toLocaleString('vi-VN')}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            Đã bán {sold}
          </span>
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
    reviews: 120,
    sold: 450,
  },
  {
    id: '2',
    name: 'Giày sneaker nam nữ thời trang thể thao',
    price: 350000,
    originalPrice: 500000,
    discount: 30,
    image: '/img/products/giay-sneaker-1.jpg',
    rating: 4.8,
    reviews: 89,
    sold: 320,
  },
  {
    id: '3',
    name: 'Điện thoại iPhone 14 Pro Max 128GB',
    price: 25000000,
    originalPrice: 28000000,
    discount: 11,
    image: '/img/products/iphone-14.jpg',
    rating: 4.9,
    reviews: 567,
    sold: 1234,
  },
  {
    id: '4',
    name: 'Túi xách nữ da thật cao cấp',
    price: 800000,
    originalPrice: 1200000,
    discount: 33,
    image: '/img/products/tui-xach-1.jpg',
    rating: 4.7,
    reviews: 234,
    sold: 678,
  },
  {
    id: '5',
    name: 'Máy lọc không khí Xiaomi Mi Air Purifier 3H',
    price: 2200000,
    originalPrice: 2500000,
    discount: 12,
    image: '/img/products/may-loc-khong-khi.jpg',
    rating: 4.6,
    reviews: 145,
    sold: 290,
  },
  {
    id: '6',
    name: 'Balo laptop chống nước đa năng',
    price: 280000,
    originalPrice: 350000,
    discount: 20,
    image: '/img/products/balo-laptop.jpg',
    rating: 4.4,
    reviews: 78,
    sold: 156,
  },
];