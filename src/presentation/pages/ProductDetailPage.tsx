"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PRODUCT_CONFIG } from '@/presentation/config/productConfig';
import { useProductFavorite } from '@/presentation/hooks/useProductFavorite';
import { useQuantity } from '@/presentation/hooks/useQuantity';
import { InfoRow } from '@/presentation/components/ui/InfoRow';
import ProductGallery from '@/presentation/components/product-detail/ProductGallery';
import PurchaseCard from '@/presentation/components/product-detail/PurchaseCard';
import ReviewSection from '@/presentation/components/product-detail/ReviewSection';
import LoadingState from '@/presentation/components/ui/LoadingState';
import ErrorState from '@/presentation/components/ui/ErrorState';
import NotFoundState from '@/presentation/components/ui/NotFoundState';
import Icon from '@/presentation/components/ui/Icon';
import { container } from '@/presentation/di/container';
import { useProductDetailViewModel } from '@/presentation/viewmodels/useProductDetailViewModel';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProductReview } from '@/domain/entities/ProductReview';
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
  const tProductCard = useTranslations('productCard');
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
    refreshReviews,
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

    
      try {
        const existingTopReview = reviews.find((r) => r.userId === user?.id && r.level === 0);
        if (existingTopReview) {
        
          await submitReply({ parentReviewId: existingTopReview.id, content: newReviewContent.trim() });
        } else {
          await submitReview({ rating: newReviewRating, content: newReviewContent.trim() });
        }

        
        setNewReviewContent('');
        setNewReviewRating(PRODUCT_CONFIG.DEFAULT_RATING);
      } catch (err: unknown) {
        
        const msg = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : String(err);
        if (typeof msg === 'string' && msg.includes('đánh giá sản phẩm này trước đó')) {
          
          try {
            await refreshReviews(1);
          } catch {}
          const existingTopReview = reviews.find((r) => r.userId === user?.id && r.level === 0);
          if (existingTopReview) {
            await submitReply({ parentReviewId: existingTopReview.id, content: newReviewContent.trim() });
            setNewReviewContent('');
            setNewReviewRating(PRODUCT_CONFIG.DEFAULT_RATING);
            return;
          }
        }

        
        setReviewFormError(typeof msg === 'string' ? msg : String(err));
      }
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
  

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.additionalImages && product.additionalImages.length > 0
      ? product.additionalImages
      : [product.image].filter(Boolean);

  

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 space-y-10">
        
          <div className="flex items-center justify-start">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-4 text-sm text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Icon name="ARROW_LEFT" alt="back" className="w-4 h-4" />
            {t('backToProducts') || 'Quay lại'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-9 -mt-8">
          <ProductGallery product={product} selectedIndex={selectedImageIndex} onSelectIndex={onSelectImage} locale={locale} />

          <div className="lg:col-span-2 space-y-6">
            <PurchaseCard
              product={product}
              stockCount={stockCount}
              quantity={quantity}
              increment={increment}
              decrement={decrement}
              onAddToCart={handleAddToCart}
              onBuyNow={() => {
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
              isAdding={isCartMutating}
              isFavorite={isFavoriteHook}
              isFavoriteLoading={isFavoriteLoadingHook}
              onToggleFavorite={handleToggleFavorite}
              locale={locale}
            />

            {(cartActionMessage || cartError || favoriteStatusMessageFromHook || favoriteHookError) && (
              <div className="mt-2 text-sm space-y-1">
                {cartActionMessage && <p className="text-emerald-600">{cartActionMessage}</p>}
                {cartError && <p className="text-red-500">{cartError}</p>}
                {favoriteStatusMessageFromHook && <p className="text-orange-500">{favoriteStatusMessageFromHook}</p>}
                {favoriteHookError && <p className="text-red-500">{favoriteHookError}</p>}
              </div>
            )}
            <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('productDetails')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <InfoRow
                  label={t('category')}
                  value={product.category?.name || product.category?.slug || product.category?.id || '—'}
                />
                <InfoRow
                  label={t('unit')}
                  value={product.unit || '—'}
                />
                <InfoRow
                  label={tProductCard('seller')}
                  value={product.owner?.userName || product.owner?.email || '—'}
                />
                <InfoRow
                  label={t('stock') || 'Stock'}
                  value={isProductAvailable
                    ? `${stockCount} ${product.unit || ''}`.trim()
                    : stockCount > 0
                      ? t('temporarilyUnavailable', { count: `${stockCount} ${product.unit || ''}`.trim() })
                      : t('outOfStock')}
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

        
        <ReviewSection
          reviews={reviews}
          reviewSummary={reviewSummary}
          reviewsPagination={reviewsPagination}
          isLoadingReviews={isLoadingReviews}
          reviewError={reviewError}
          changeReviewPage={changeReviewPage}
          isSubmittingReview={isSubmittingReview}
          submitReply={handleSubmitReply}
          deleteReview={handleDeleteReview}
          userId={user?.id}
          activeReplyId={activeReplyId}
          setActiveReplyId={setActiveReplyId}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          newReviewRating={newReviewRating}
          setNewReviewRating={setNewReviewRating}
          newReviewContent={newReviewContent}
          setNewReviewContent={setNewReviewContent}
          isAuthenticated={isAuthenticated}
          handleSubmitReview={handleSubmitReview}
          reviewFormError={reviewFormError}
        />
      </div>
    </div>
  );
};

 
