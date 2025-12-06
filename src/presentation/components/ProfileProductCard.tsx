import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Product } from '@/domain/entities/Product';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

interface ProfileProductCardProps {
  product: Product;
  router: { push: (path: string) => void };
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onToggleAvailability?: (productId: string, nextInStock: boolean) => void;
  isBusy?: boolean;
}

const ProfileProductCard: React.FC<ProfileProductCardProps> = ({
  product,
  router,
  onEdit,
  onDelete,
  onToggleAvailability,
  isBusy = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isBusy) {
      setIsMenuOpen(false);
    }
  }, [isBusy]);

  const showActions = Boolean(onEdit || onDelete || onToggleAvailability);

  const closeMenu = () => setIsMenuOpen(false);

  const handleClick = () => {
    router.push(`/main/products/${product.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    closeMenu();
    onEdit?.(product.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    const confirmed = confirm('Bạn có chắc muốn xóa sản phẩm này?');
    if (!confirmed) {
      return;
    }
    closeMenu();
    onDelete?.(product.id);
  };

  const handleToggleAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy || !onToggleAvailability) return;
    closeMenu();
    onToggleAvailability(product.id, !isInStock);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    setIsMenuOpen((prev) => !prev);
  };

  const priceLabel = product.price ? formatCurrency(product.price) : 'Liên hệ';
  const stockCount = product.stock ?? product.stockQuantity ?? 0;
  const thumbnail = product.image || product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';
  const isInStock = product.inStock !== false && stockCount > 0;

  return (
    <div className="group bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-orange-300 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={thumbnail}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            -{product.discount}%
          </div>
        )}
        {showActions && (
          <div className="absolute top-3 right-3" ref={menuRef}>
            <button
              type="button"
              onClick={handleMenuToggle}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-gray-600 shadow-md transition hover:bg-white hover:text-orange-600 focus:outline-none"
              title="Tùy chọn"
              disabled={isBusy}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="14" r="1.5" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {onEdit && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    disabled={isBusy}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </button>
                )}
                {onToggleAvailability && (
                  <button
                    type="button"
                    onClick={handleToggleAvailability}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    disabled={isBusy}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                    {isInStock ? 'Đánh dấu hết hàng' : 'Đánh dấu còn hàng'}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    disabled={isBusy}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa sản phẩm
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4" onClick={handleClick}>
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight min-h-[2rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between -mt-3">
          <span className="text-xl sm:text-2xl font-bold text-orange-500">
            {priceLabel}
          </span>
          
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{product.category?.name || 'Danh mục'}</span>
          <div className={`px-1 py-1 rounded-full text-xs font-medium ${
            isInStock
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {isInStock ? `Còn ${stockCount}` : 'Hết hàng'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileProductCard;