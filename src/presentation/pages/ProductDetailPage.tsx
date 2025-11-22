"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/presentation/lib/formatters';
import { PRODUCT_CONFIG } from '@/presentation/config/productConfig';
import { useProductFavorite } from '@/presentation/hooks/useProductFavorite';
import { useQuantity } from '@/presentation/hooks/useQuantity';
import { InfoRow } from '@/presentation/components/ui/InfoRow';
import LoadingState from '@/presentation/components/ui/LoadingState';
import ErrorState from '@/presentation/components/ui/ErrorState';
import NotFoundState from '@/presentation/components/ui/NotFoundState';
import { StarRatingDisplay } from '@/presentation/components/ui/StarRating';
import { container } from '@/presentation/di/container';
import { useProductDetailViewModel } from '@/presentation/viewmodels/useProductDetailViewModel';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProductReview } from '@/domain/entities/ProductReview';
import ProductReviewItem from '@/presentation/components/ProductReviewItem';
import { useCart } from '@/shared/hooks/useCart';


 

export const ProductDetailPage: React.FC = () => {
  const params = useParams() as { id?: string; locale?: string };
  const locale = params?.locale || 'vi';
  const router = useRouter();
  const productId = params?.id || '';
  const { user, isAuthenticated } = useAuth();
  const cartTranslations = useTranslations('cart');
  const translateCart = cartTranslations as unknown as (key: string, values?: Record<string, unknown>) => string;
  const tProducts = useTranslations('products');
  const tFav = useTranslations('favorites');
  const t = useTranslations('product');
  const {
    addItem,
    isMutating: isCartMutating,
    error: cartError,
    lastActionMessage: cartMessage,
    setError: setCartError,
  } = useCart();

  const {
    product,
    isLoadingProduct,
    productError,
    refreshProduct,
    reviews,
    reviewSummary,
    reviewsPagination,
    isLoadingReviews,
    reviewError,
    submitReview,
    submitReply,
    deleteReview,
    changeReviewPage,
    isSubmittingReview
  } = useProductDetailViewModel(
    {
      getProductByIdUseCase: container.getProductByIdUseCase,
      getProductReviewsUseCase: container.getProductReviewsUseCase,
      createProductReviewUseCase: container.createProductReviewUseCase,
      updateProductReviewUseCase: container.updateProductReviewUseCase,
      deleteProductReviewUseCase: container.deleteProductReviewUseCase
    },
    productId
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newReviewRating, setNewReviewRating] = useState(PRODUCT_CONFIG.DEFAULT_RATING);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const cartActionMessage = cartMessage ? translateCart(`messages.${cartMessage}`) : null;
  const {
    isFavorite: isFavoriteHook,
    isLoading: isFavoriteLoadingHook,
    error: favoriteHookError,
    statusMessage: favoriteStatusMessageFromHook,
    toggleFavorite: handleToggleFavorite
  } = useProductFavorite(productId, isAuthenticated, user?.id);
  const stockCount = typeof product?.stock === 'number'
    ? product.stock
    : typeof product?.stockQuantity === 'number'
      ? product.stockQuantity
      : 0;

  const { quantity, setQuantity: setQuantityHook, increment, decrement } = useQuantity(stockCount, PRODUCT_CONFIG.MIN_QUANTITY);

  useEffect(() => {
    
    const localStockCount = product
      ? (typeof product.stock === 'number' ? product.stock : typeof product.stockQuantity === 'number' ? product.stockQuantity : 0)
      : undefined;
    if (typeof localStockCount === 'number') {
      setQuantityHook(Math.max(PRODUCT_CONFIG.MIN_QUANTITY, Math.min(localStockCount, quantity)));
    }
  }, [product, quantity, setQuantityHook]);
  const [reviewFormError, setReviewFormError] = useState<string | null>(null);

  const ratingBuckets = useMemo(() => {
    const buckets: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    Object.entries(reviewSummary.distribution || {}).forEach(([key, count]) => {
      const numericKey = Number(key);
      if (Number.isNaN(numericKey)) return;
      const bucket = Math.min(5, Math.max(1, Math.round(numericKey)));
      buckets[bucket] += count;
    });
    return buckets;
  }, [reviewSummary.distribution]);

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewFormError(null);
    if (!isAuthenticated) {
      setReviewFormError(tFav('loginToFavorite') || 'Bạn cần đăng nhập để đánh giá sản phẩm.');
      return;
    }
    if (!newReviewContent.trim()) {
      setReviewFormError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    await submitReview({ rating: newReviewRating, content: newReviewContent.trim() });
    setNewReviewContent('');
    setNewReviewRating(PRODUCT_CONFIG.DEFAULT_RATING);
  };

  const handleSubmitReply = async (event: React.FormEvent<HTMLFormElement>, parent: ProductReview) => {
    event.preventDefault();
    if (!activeReplyId) return;
    if (!replyContent.trim()) {
      setReviewFormError('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    await submitReply({ parentReviewId: activeReplyId, content: replyContent.trim(), mentionedUserId: parent.userId });
    setReplyContent('');
    setActiveReplyId(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(tProducts('confirmDelete') || 'Bạn có chắc muốn xóa đánh giá này?')) return;
    await deleteReview(reviewId);
  };
  const onSelectImage = (index: number) => setSelectedImageIndex(index);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    const availableStock = typeof product.stock === 'number'
      ? product.stock
      : typeof product.stockQuantity === 'number'
        ? product.stockQuantity
        : 0;
    const canPurchase = product.inStock !== false && availableStock > 0;
    if (!canPurchase) {
      setCartError(t('outOfStock') || 'Sản phẩm tạm thời hết hàng.');
      return;
    }

    setCartError(null);
    await addItem({
      productId: product.id,
      quantity: Math.min(quantity, availableStock),
      price: product.price,
      unit: product.unit,
      title: product.name,
      thumbnail: images[0] || product.image,
    });
  };
  // use dedicated ReviewItem component

  if (isLoadingProduct) {
    return <LoadingState message={tProducts('loading') || 'Đang tải sản phẩm...'} />;
  }

  if (productError) {
    return <ErrorState message={productError} onRetry={refreshProduct} retryLabel={tProducts('retry') || 'Thử lại'} />;
  }

  if (!product) {
    return <NotFoundState message={t('notFoundMessage') || 'Sản phẩm không tồn tại hoặc đã bị xóa'} />;
  }

  
  const isProductAvailable = product.inStock !== false && stockCount > 0;
  const stockStatusLabel = isProductAvailable ? 'Còn hàng' : 'Hết hàng';
  const stockStatusWithCount = isProductAvailable ? `${stockStatusLabel} (${stockCount})` : stockStatusLabel;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.additionalImages && product.additionalImages.length > 0
      ? product.additionalImages
      : [product.image].filter(Boolean);

  const mainImage = images[selectedImageIndex] || images[0];

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 space-y-10">
        {/* Back Button */}
        <div className="flex items-center justify-start">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-4 text-sm text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToProducts') || 'Quay lại'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-9 -mt-8">
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm p-6">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-85 md:h-[28rem]">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-contain object-center"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">{t('noImage') || 'Không có hình ảnh'}</div>
                )}
                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {product.isAvailable ? (t('inStock') || 'Còn hàng') : (t('outOfStock') || 'Hết hàng')}
                </span>
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {images.map((img: string, index: number) => (
                    <button
                      key={img || index}
                      onClick={() => onSelectImage(index)}
                      className={`relative w-16 h-16 rounded-md overflow-hidden border transition-all flex-shrink-0 ${selectedImageIndex === index ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}
                    >
                      {img ? (
                        <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">No image</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {product.owner && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">{tProducts('seller') || 'Người đăng sản phẩm'}</p>
                  <Link
                    href={`/${locale}/main/users/${encodeURIComponent(product.owner.id)}?userName=${encodeURIComponent(product.owner.userName || '')}&email=${encodeURIComponent(product.owner.email || '')}&avatar=${encodeURIComponent(product.owner.avatar || '')}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      {product.owner.avatar ? (
                        <Image
                          src={product.owner.avatar}
                          alt={product.owner.userName || 'Seller'}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-orange-200 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                          {(product.owner.userName || 'S').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition-colors truncate">
                        {product.owner.userName || product.owner.email || 'Người dùng ẩn danh'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.owner.email || 'Không công khai'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                    Sản phẩm {product.name}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Mã sản phẩm: <strong className="text-gray-700">{product.id}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isFavoriteHook ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    onClick={handleToggleFavorite}
                    aria-pressed={isFavoriteHook}
                    disabled={isFavoriteLoadingHook}
                  >
                    <svg
                      className={`w-4 h-4 ${isFavoriteHook ? 'text-red-500' : 'text-gray-400'}`}
                      viewBox="0 0 24 24"
                      fill={isFavoriteHook ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center justify-end gap-2 text-lg font-semibold text-orange-500">
                    <span>{(product.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice)}</p>
                  )}
                </div>
                {product.originalPrice && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-semibold">
                    Tiết kiệm {formatCurrency((product.originalPrice || 0) - (product.price || 0))}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${isProductAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${isProductAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stockStatusWithCount}
                  </span>
                </div>

                <div className="border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between bg-gray-50">
                  <div>
                    <p className="text-sm text-gray-500">{t('quantity') || 'Chọn số lượng'}</p>
                    <p className="text-xs text-gray-400">Tối đa {stockCount} sản phẩm</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrement}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-white"
                    >
                      –
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-700">{quantity}</span>
                    <button
                      onClick={increment}
                      className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg transition-colors ${isProductAvailable && quantity < stockCount ? 'text-gray-600 hover:bg-white' : 'text-gray-400 cursor-not-allowed bg-gray-100'}`}
                      disabled={!isProductAvailable || quantity >= stockCount}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!isProductAvailable || isCartMutating}
                >
                  {isCartMutating ? (t('adding') || 'Đang thêm...') : (t('addToCart') || 'Thêm vào giỏ hàng')}
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      buyNow: 'true',
                      productId: product.id,
                      quantity: Math.min(quantity, stockCount).toString(),
                      price: product.price.toString(),
                      title: product.name,
                      thumbnail: (images[0] || product.image || '').toString(),
                      unit: product.unit || '',
                    });
                    router.push(`/${locale}/main/checkout?${params.toString()}`);
                  }}
                  className="py-3 rounded-xl border border-orange-500 text-orange-500 font-semibold hover:bg-orange-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!isProductAvailable}
                >
                  {t('buyNow') || 'Mua ngay'}
                </button>
              </div>
              {(cartActionMessage || cartError || favoriteStatusMessageFromHook || favoriteHookError) && (
                <div className="mt-2 text-sm space-y-1">
                  {cartActionMessage && <p className="text-emerald-600">{cartActionMessage}</p>}
                  {cartError && <p className="text-red-500">{cartError}</p>}
                  {favoriteStatusMessageFromHook && <p className="text-orange-500">{favoriteStatusMessageFromHook}</p>}
                  {favoriteHookError && <p className="text-red-500">{favoriteHookError}</p>}
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin sản phẩm</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <InfoRow
                  label="Danh mục"
                  value={product.category?.name || product.category?.slug || product.category?.id || '—'}
                />
                <InfoRow
                  label="Đơn vị"
                  value={product.unit || '—'}
                />
                <InfoRow
                  label="Người đăng"
                  value={product.owner?.userName || product.owner?.email || '—'}
                />
                <InfoRow
                  label="Tồn kho"
                  value={isProductAvailable
                    ? `${stockCount} ${product.unit || ''}`.trim()
                    : stockCount > 0
                      ? `Tạm ngưng bán (${`${stockCount} ${product.unit || ''}`.trim()})`
                      : 'Hết hàng'}
                />
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              {product.description && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <h3 className="font-semibold text-gray-800 mb-2">{t('productDetails') || 'Mô tả chi tiết'}</h3>
                  <p>{product.description}</p>
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{reviewSummary.average.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">Trên {reviewSummary.totalReviews} {t('reviews') || 'lượt đánh giá'}</p>
                </div>
                <StarRatingDisplay rating={reviewSummary.average} size="lg" />
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingBuckets[star] || 0;
                  const percentage = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-8 text-sm font-medium text-gray-600">{star} ★</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{tProducts('writeReview') || 'Viết đánh giá của bạn'}</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewFormError && <p className="text-sm text-red-500">{reviewFormError}</p>}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Chọn số sao ({newReviewRating.toFixed(1)})</p>
                  <div className="flex items-center gap-4">
                    <StarRatingDisplay rating={newReviewRating} size="md" />
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      value={newReviewRating}
                      onChange={(event) => setNewReviewRating(parseFloat(event.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <textarea
                  value={newReviewContent}
                  onChange={(event) => setNewReviewContent(event.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={isSubmittingReview}
                />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {isAuthenticated
                      ? tProducts('reviewHint') || 'Đánh giá của bạn sẽ giúp khách hàng khác lựa chọn dễ dàng hơn.'
                      : tFav('loginToFavorite') || 'Bạn cần đăng nhập để gửi đánh giá.'}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                    disabled={isSubmittingReview || !isAuthenticated}
                  >
                    {isSubmittingReview ? (tProducts('loading') || 'Đang gửi...') : (tProducts('submit') || 'Gửi đánh giá')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tất cả đánh giá</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Trang {reviewsPagination.page}/{reviewsPagination.totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    onClick={() => changeReviewPage(Math.max(1, reviewsPagination.page - 1))}
                    disabled={reviewsPagination.page <= 1 || isLoadingReviews}
                  >
                    Trước
                  </button>
                  <button
                    className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    onClick={() => changeReviewPage(Math.min(reviewsPagination.totalPages, reviewsPagination.page + 1))}
                    disabled={reviewsPagination.page >= reviewsPagination.totalPages || isLoadingReviews}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>

            {reviewError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {reviewError}
              </div>
            )}

            {isLoadingReviews ? (
              <div className="text-center py-8 text-sm text-gray-500">{tProducts('loading') || 'Đang tải đánh giá...'}</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">{t('noReviewsYet') || 'Chưa có đánh giá nào cho sản phẩm này.'}</div>
            ) : (
              <div className="space-y-6">
                  {reviews.map((review) => (
                    <ProductReviewItem
                      key={review.id}
                      review={review}
                      level={0}
                      userId={user?.id}
                      activeReplyId={activeReplyId}
                      setActiveReplyId={setActiveReplyId}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      isSubmittingReview={isSubmittingReview}
                      onSubmitReply={handleSubmitReply}
                      onDeleteReview={handleDeleteReview}
                      tProducts={tProducts}
                      tFav={tFav}
                    />
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

 
