"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/presentation/di/container';
import { useProductDetailViewModel } from '@/presentation/viewmodels/useProductDetailViewModel';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProductReview } from '@/domain/entities/ProductReview';
import { useCart } from '@/shared/hooks/useCart';

const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatRelativeTime = (isoDate: string) => {
  const now = new Date();
  const target = new Date(isoDate);
  const diff = (now.getTime() - target.getTime()) / 1000;

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} ngày trước`;
  return target.toLocaleDateString('vi-VN');
};

type StarProps = {
  fillPercentage: number;
  sizeClass: string;
};

const StarIcon: React.FC<StarProps> = ({ fillPercentage, sizeClass }) => (
  <span className={`relative inline-block ${sizeClass}`}>
    <svg
      viewBox="0 0 24 24"
      className="absolute inset-0 text-gray-200"
      fill="currentColor"
    >
      <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
    <span
      className="absolute inset-0 overflow-hidden text-orange-500"
      style={{ width: `${fillPercentage}%` }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </span>
  </span>
);

const StarRatingDisplay: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const rawFill = Math.max(0, Math.min(1, rating - index));
        return <StarIcon key={starValue} fillPercentage={rawFill * 100} sizeClass={sizeMap[size]} />;
      })}
    </div>
  );
};

export const ProductDetailPage: React.FC = () => {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const productId = params?.id || '';
  const { user, isAuthenticated } = useAuth();
  const cartTranslations = useTranslations('cart');
  const translateCart = cartTranslations as unknown as (key: string, values?: Record<string, unknown>) => string;
  const tFav = useTranslations('favorites');
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

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const cartActionMessage = cartMessage ? translateCart(`messages.${cartMessage}`) : null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [favoriteStatusMessage, setFavoriteStatusMessage] = useState<string | null>(null);
  const favoriteStatusTimeoutRef = useRef<number | null>(null);

  const clearFavoriteStatusTimeout = useCallback(() => {
    if (favoriteStatusTimeoutRef.current) {
      window.clearTimeout(favoriteStatusTimeoutRef.current);
      favoriteStatusTimeoutRef.current = null;
    }
  }, []);

  const scheduleFavoriteStatusClear = useCallback(() => {
    clearFavoriteStatusTimeout();
    favoriteStatusTimeoutRef.current = window.setTimeout(() => {
      setFavoriteStatusMessage(null);
      favoriteStatusTimeoutRef.current = null;
    }, 3000);
  }, [clearFavoriteStatusTimeout]);

  const loadFavoriteStatus = useCallback(async () => {
    if (!productId || !isAuthenticated || !user?.id) {
      setIsFavorite(false);
      return;
    }

    try {
      setIsFavoriteLoading(true);
      setFavoriteError(null);
      setFavoriteStatusMessage(null);
      const favorites = await container.getFavoritesUseCase.execute(user.id);
      setIsFavorite(favorites.some((item) => item.productId === productId));
    } catch (error) {
      console.error('Error loading favorite status:', error);
      setFavoriteError(tFav('cannotLoadFavoriteStatus'));
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [isAuthenticated, productId, user?.id, tFav]);

  useEffect(() => {
    loadFavoriteStatus();
    return () => {
      clearFavoriteStatusTimeout();
    };
  }, [loadFavoriteStatus, clearFavoriteStatusTimeout]);

  const handleToggleFavorite = async () => {
    if (!productId) {
      return;
    }

    if (!isAuthenticated || !user?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsFavoriteLoading(true);
      setFavoriteError(null);
      const favorites = await container.toggleFavoriteUseCase.execute(productId);
      const nextIsFavorite = favorites.some((item) => item.productId === productId);
      setIsFavorite(nextIsFavorite);
      setFavoriteStatusMessage(nextIsFavorite ? tFav('addedToFavorites') : tFav('removedFromFavorites'));
      scheduleFavoriteStatusClear();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      clearFavoriteStatusTimeout();
      setFavoriteStatusMessage(null);
      setFavoriteError(tFav('cannotUpdateFavorite'));
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    setCartError(null);
    await addItem({
      productId: product.id,
      quantity,
      price: product.price,
      unit: product.unit,
      title: product.name,
      thumbnail: images[0] || product.image,
    });
  };

  const onSelectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

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
    if (!isAuthenticated) {
      alert('Bạn cần đăng nhập để đánh giá sản phẩm.');
      return;
    }
    if (!newReviewContent.trim()) {
      alert('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    await submitReview({
      rating: newReviewRating,
      content: newReviewContent.trim()
    });

    setNewReviewContent('');
    setNewReviewRating(5);
  };

  const handleSubmitReply = async (event: React.FormEvent<HTMLFormElement>, parent: ProductReview) => {
    event.preventDefault();
    if (!activeReplyId) return;
    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    await submitReply({
      parentReviewId: activeReplyId,
      content: replyContent.trim(),
      mentionedUserId: parent.userId
    });

    setReplyContent('');
    setActiveReplyId(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    await deleteReview(reviewId);
  };

  if (!productId) {
    return <NotFoundState message="Không tìm thấy sản phẩm" />;
  }

  if (isLoadingProduct) {
    return <LoadingState />;
  }

  if (productError) {
    return <ErrorState error={productError} onRetry={refreshProduct} />;
  }

  if (!product) {
    return <NotFoundState message="Sản phẩm không tồn tại hoặc đã bị xóa" />;
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.additionalImages && product.additionalImages.length > 0
      ? product.additionalImages
      : [product.image].filter(Boolean);

  const mainImage = images[selectedImageIndex] || images[0];

  const renderReview = (review: ProductReview, level: number = 0) => {
    const isOwner = user?.id === review.userId;
    const canReply = level < 2;

    return (
      <div key={review.id} className={`flex gap-3 ${level > 0 ? 'pl-8 border-l border-gray-100' : ''}`}>
        <div className="flex-shrink-0">
          {review.user?.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.userName || 'user avatar'}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white flex items-center justify-center font-semibold">
              {(review.user?.userName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">{review.user?.userName || 'Người dùng ẩn danh'}</p>
              <p className="text-xs text-gray-500">{formatRelativeTime(review.createdAt)}</p>
            </div>
            {level === 0 && review.rating !== undefined && (
              <div className="flex items-center gap-2">
                <StarRatingDisplay rating={review.rating} size="sm" />
                <span className="text-sm font-medium text-orange-500">{review.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed shadow-sm">
            {review.content}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {canReply && (
              <button
                onClick={() => {
                  setActiveReplyId(review.id);
                  setReplyContent('');
                }}
                className="font-medium text-orange-500 hover:text-orange-600"
              >
                Trả lời
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="font-medium text-red-500 hover:text-red-600"
              >
                Xóa
              </button>
            )}
          </div>

          {activeReplyId === review.id && (
            <form
              onSubmit={(event) => handleSubmitReply(event, review)}
              className="mt-2 flex flex-col gap-2"
            >
              <textarea
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                rows={3}
                placeholder="Viết phản hồi của bạn..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={isSubmittingReview}
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveReplyId(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {Array.isArray(review.replies) && review.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {review.replies.map((child) => renderReview(child, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

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
            Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 -mt-8">
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm p-6">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Không có hình ảnh</div>
                )}
                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {product.isAvailable ? 'Sẵn sàng' : 'Tạm hết'}
                </span>
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.map((img: string, index: number) => (
                    <button
                      key={img || index}
                      onClick={() => onSelectImage(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden border ${selectedImageIndex === index ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent'}`}
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
                    <span>Sẵn kho: <strong className="text-gray-700">{product.stock}</strong></span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isFavorite ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    onClick={handleToggleFavorite}
                    aria-pressed={isFavorite}
                    disabled={isFavoriteLoading}
                  >
                    <svg
                      className={`w-4 h-4 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                      viewBox="0 0 24 24"
                      fill={isFavorite ? 'currentColor' : 'none'}
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
                  <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                  </span>
                </div>

                <div className="border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between bg-gray-50">
                  <div>
                    <p className="text-sm text-gray-500">Chọn số lượng</p>
                    <p className="text-xs text-gray-400">Tối đa {product.stock} sản phẩm</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-white"
                    >
                      –
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-700">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity((prev) => {
                          if (!product.stock) return prev;
                          return Math.min(product.stock, prev + 1);
                        })
                      }
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition"
                  disabled={product.stock === 0 || isCartMutating}
                >
                  {isCartMutating ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </button>
                <button className="py-3 rounded-xl border border-orange-500 text-orange-500 font-semibold hover:bg-orange-50 transition">
                  Mua ngay
                </button>
              </div>
              {(cartActionMessage || cartError || favoriteStatusMessage || favoriteError) && (
                <div className="mt-2 text-sm space-y-1">
                  {cartActionMessage && <p className="text-emerald-600">{cartActionMessage}</p>}
                  {cartError && <p className="text-red-500">{cartError}</p>}
                  {favoriteStatusMessage && <p className="text-orange-500">{favoriteStatusMessage}</p>}
                  {favoriteError && <p className="text-red-500">{favoriteError}</p>}
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
                  value={typeof product.stock === 'number' ? `${product.stock} ${product.unit || ''}`.trim() : '—'}
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
                  <h3 className="font-semibold text-gray-800 mb-2">Mô tả chi tiết</h3>
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
                  <p className="text-sm text-gray-500">Trên {reviewSummary.totalReviews} lượt đánh giá</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Viết đánh giá của bạn</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
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
                      ? 'Đánh giá của bạn sẽ giúp khách hàng khác lựa chọn dễ dàng hơn.'
                      : 'Bạn cần đăng nhập để gửi đánh giá.'}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                    disabled={isSubmittingReview || !isAuthenticated}
                  >
                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
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
              <div className="text-center py-8 text-sm text-gray-500">Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => renderReview(review))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; compact?: boolean }> = ({ label, value, compact }) => (
  <div className={`flex flex-col ${compact ? 'text-xs' : 'text-sm'}`}>
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-gray-700">{value || '—'}</span>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <div className="aspect-square bg-white/60 rounded-3xl animate-pulse" />
      <div className="space-y-4">
        <div className="h-12 bg-white/60 rounded-2xl animate-pulse" />
        <div className="h-10 bg-white/60 rounded-2xl animate-pulse" />
        <div className="h-24 bg-white/60 rounded-2xl animate-pulse" />
        <div className="h-20 bg-white/60 rounded-2xl animate-pulse" />
      </div>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="bg-white shadow-xl rounded-3xl px-8 py-10 text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-3xl">
        !
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
      <p className="text-sm text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600"
      >
        Thử lại
      </button>
    </div>
  </div>
);

const NotFoundState: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white shadow-lg rounded-3xl px-8 py-10 text-center max-w-md">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-4xl">
        📦
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800"
      >
        Quay lại
      </button>
    </div>
  </div>
);
