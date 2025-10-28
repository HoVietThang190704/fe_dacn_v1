'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface ProductDetailPageProps {
  productId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const t = useTranslations('product');
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useProductDetailViewModel(container.getProductByIdUseCase, productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data based on productId
  const mockProducts = {
    'p1': {
      id: 'p1',
      name: 'Táo Envy New Zealand cao cấp - Hộp 1kg',
      description: 'Táo Envy New Zealand nhập khẩu chính hãng, được trồng và thu hoạch theo tiêu chuẩn quốc tế. Táo có vỏ bóng mượt, màu đỏ tươi, thịt giòn ngọt, không hạt. Phù hợp để ăn trực tiếp hoặc làm salad.',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80'
      ],
      price: 85000,
      originalPrice: 120000,
      discount: 29,
      unit: 'hộp',
      category: 'fruits',
      stock: 50,
      sold: 1234,
      rating: 4.8,
      reviewCount: 156,
      brand: 'Fresh Market',
      origin: 'New Zealand'
    },
    'p2': {
      id: 'p2',
      name: 'Cam sành Cao Phong ngọt thanh - Túi 1kg',
      description: 'Cam sành Cao Phong nổi tiếng với vị ngọt thanh, vỏ mỏng, nước nhiều. Cam được trồng theo phương pháp hữu cơ, không sử dụng hóa chất độc hại. Phù hợp để vắt nước uống hàng ngày.',
      image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80'
      ],
      price: 39000,
      originalPrice: 55000,
      discount: 29,
      unit: 'túi',
      category: 'fruits',
      stock: 100,
      sold: 2341,
      rating: 4.6,
      reviewCount: 89,
      brand: 'Fresh Market',
      origin: 'Việt Nam'
    },
    'p3': {
      id: 'p3',
      name: 'Nho xanh không hạt Úc nhập khẩu - Hộp 500g',
      description: 'Nho xanh không hạt Úc được chọn lọc kỹ càng, có vị ngọt tự nhiên, giòn tan. Nho được bảo quản lạnh suốt quá trình vận chuyển để giữ độ tươi ngon.',
      image: 'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=400&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=400&q=80'
      ],
      price: 110000,
      originalPrice: 150000,
      discount: 27,
      unit: 'hộp',
      category: 'fruits',
      stock: 30,
      sold: 891,
      rating: 4.9,
      reviewCount: 234,
      brand: 'Fresh Market',
      origin: 'Australia'
    },
    'p4': {
      id: 'p4',
      name: 'Dưa hấu không hạt Mỹ siêu ngọt - Trái 3-4kg',
      description: 'Dưa hấu không hạt Mỹ được nhập khẩu trực tiếp, có vị ngọt đậm đà, thịt đỏ tươi, hạt rất ít. Dưa được chọn lọc kỹ càng về độ chín và chất lượng.',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784l66?auto=format&fit=crop&w=400&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784l66?auto=format&fit=crop&w=400&q=80'
      ],
      price: 45000,
      originalPrice: 60000,
      discount: 25,
      unit: 'kg',
      category: 'fruits',
      stock: 80,
      sold: 3456,
      rating: 4.7,
      reviewCount: 412,
      brand: 'Fresh Market',
      origin: 'USA'
    },
    'p5': {
      id: 'p5',
      name: 'Cà chua cherry Đà Lạt tươi ngon - Hộp 250g',
      description: 'Cà chua cherry Đà Lạt được trồng trên vùng đất bazan màu mỡ, có vị ngọt tự nhiên, giàu vitamin C. Cà chua nhỏ gọn, dễ ăn, phù hợp cho trẻ em.',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80'
      ],
      price: 28000,
      originalPrice: 35000,
      discount: 20,
      unit: 'hộp',
      category: 'vegetables',
      stock: 120,
      sold: 5678,
      rating: 4.5,
      reviewCount: 178,
      brand: 'Fresh Market',
      origin: 'Việt Nam'
    },
    'p6': {
      id: 'p6',
      name: 'Dâu tây Đà Lạt hữu cơ an toàn - Hộp 250g',
      description: 'Dâu tây Đà Lạt được trồng theo phương pháp hữu cơ, không sử dụng hóa chất. Dâu có màu đỏ tươi, vị ngọt chua cân bằng, giàu vitamin và khoáng chất.',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80'
      ],
      price: 95000,
      originalPrice: 120000,
      discount: 21,
      unit: 'hộp',
      category: 'fruits',
      stock: 45,
      sold: 782,
      rating: 4.8,
      reviewCount: 145,
      brand: 'Fresh Market',
      origin: 'Việt Nam'
    }
  };

  const product = mockProducts[productId as keyof typeof mockProducts];

  // Comment out loading/error states
  // if (viewModel.isLoading) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }
  // if (!viewModel.product) {
  //   return <NotFoundState />;
  // }

  if (!product) {
    return <NotFoundState t={t} />;
  }

  const images = [product.image, ...(product.additionalImages || [])];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            ← {t('backToProducts')}
          </button>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-600">
          <span>{t('home')}</span> / <span>{product.category}</span> / <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400 text-sm sm:text-base">
                  {'★'.repeat(Math.floor(product.rating || 4.5))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating || 4.5} ({product.reviewCount || 123} {t('reviews')})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-orange-500">
                  ₫{(product.price * 20000).toLocaleString('vi-VN')}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₫{(product.originalPrice * 20000).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <div className="text-green-600 font-medium text-sm sm:text-base">
                  Tiết kiệm ₫{((product.originalPrice - product.price) * 20000).toLocaleString('vi-VN')}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-sm sm:text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${t('inStock')} (${product.stock})` : t('outOfStock')}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('quantity')}</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-16 text-center text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                disabled={product.stock === 0}
                className="w-full py-3 px-6 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {t('addToCart')}
              </button>
              <button className="w-full py-3 px-6 border border-orange-500 text-orange-500 rounded-lg font-medium hover:bg-orange-50 text-sm sm:text-base">
                {t('buyNow')}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-4 lg:pt-6 space-y-4">
              <h3 className="text-lg font-semibold">{t('productDetails')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('category')}:</span>
                  <span className="ml-2">{product.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('unit')}:</span>
                  <span className="ml-2">{product.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('brand')}:</span>
                  <span className="ml-2">{product.brand || 'Fresh Market'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('origin')}:</span>
                  <span className="ml-2">{product.origin || 'Việt Nam'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-8 bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{t('description')}</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{t('reviews')}</h3>
          <div className="text-center py-8 text-gray-500">
            {t('noReviewsYet')}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Thử lại
      </button>
    </div>
  </div>
);

const NotFoundState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-gray-400 text-6xl mb-4">📦</div>
      <h2 className="text-xl font-semibold mb-2">{t('notFound')}</h2>
      <p className="text-gray-600 mb-4">{t('notFoundMessage')}</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        {t('backToProducts')}
      </button>
    </div>
  </div>
);