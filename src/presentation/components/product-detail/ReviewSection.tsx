"use client";
import React from 'react';
import { ProductReview } from '@/domain/entities/ProductReview';
import { ProductReviewSummary, PaginatedProductReviews } from '@/domain/entities/ProductReview';
import { useTranslations } from 'next-intl';
import ProductReviewItem from '@/presentation/components/ProductReviewItem';
import { StarRatingDisplay } from '@/presentation/components/ui/StarRating';

type Props = {
  reviews: ProductReview[];
  reviewSummary: ProductReviewSummary;
  reviewsPagination: PaginatedProductReviews['pagination'];
  isLoadingReviews: boolean;
  reviewError?: string | null;
  changeReviewPage: (p: number) => void;
  isSubmittingReview: boolean;
  
  newReviewRating: number;
  setNewReviewRating: (r: number) => void;
  newReviewContent: string;
  setNewReviewContent: (c: string) => void;
  isAuthenticated: boolean;
  handleSubmitReview: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  reviewFormError?: string | null;
  submitReply: (event: React.FormEvent<HTMLFormElement>, parent: ProductReview) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  userId?: string;
  activeReplyId: string | null;
  setActiveReplyId: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
};

const ReviewSection: React.FC<Props> = ({ reviews, reviewSummary, reviewsPagination, isLoadingReviews, reviewError, changeReviewPage, isSubmittingReview, submitReply, deleteReview, userId, activeReplyId, setActiveReplyId, replyContent, setReplyContent, newReviewRating, setNewReviewRating, newReviewContent, setNewReviewContent, isAuthenticated, handleSubmitReview, reviewFormError }) => {
  const t = useTranslations('product');
  const tFav = useTranslations('favorites');

  const userHasTopReview = Boolean(reviews.find((r) => r.userId === userId && r.level === 0));

  return (
    <section className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-bold text-gray-900">{reviewSummary.average.toFixed(1)}</p>
              <p className="text-sm text-gray-500">{t('onReviews', { count: reviewSummary.totalReviews })}</p>
            </div>
            <StarRatingDisplay rating={reviewSummary.average} size="lg" />
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = (reviewSummary.distribution && reviewSummary.distribution[star]) || 0;
              const percentage = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium text-gray-600">{star} ★</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${percentage}%` }} /></div>
                  <span className="w-10 text-right text-xs text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('writeReview')}</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {reviewFormError && <p className="text-sm text-red-500">{reviewFormError}</p>}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
              {userHasTopReview ? (
                <p className="text-sm text-gray-600">{t('alreadyRatedMessage') || 'You already rated this product — additional submissions will be treated as replies.'}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('selectStars', { rating: newReviewRating.toFixed ? newReviewRating.toFixed(1) : newReviewRating })}</p>
                  <div className="flex items-center gap-4">
                    <StarRatingDisplay rating={newReviewRating} size="md" />
                    <input type="range" min={1} max={5} step={0.5} value={newReviewRating} onChange={(event) => setNewReviewRating(parseFloat(event.target.value))} className="flex-1" />
                  </div>
                </>
              )}
            </div>

            <textarea value={newReviewContent} onChange={(event) => setNewReviewContent(event.target.value)} placeholder={t('reviewPlaceholder')} rows={4} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400" disabled={isSubmittingReview} />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {isAuthenticated ? (t('reviewHint') || 'Your review will help others choose.') : (tFav('loginToFavorite') || 'Please sign in to leave a review.')}
              </span>
              <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50" disabled={isSubmittingReview || !isAuthenticated}>
                {isSubmittingReview ? 'Sending...' : (t('submit') || 'Submit review')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('allReviews')}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{t('pageInfo', { page: reviewsPagination.page, total: reviewsPagination.totalPages })}</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40" onClick={() => changeReviewPage(Math.max(1, reviewsPagination.page - 1))} disabled={reviewsPagination.page <= 1 || isLoadingReviews}>{t('prev')}</button>
              <button className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40" onClick={() => changeReviewPage(Math.min(reviewsPagination.totalPages, reviewsPagination.page + 1))} disabled={reviewsPagination.page >= reviewsPagination.totalPages || isLoadingReviews}>{t('next')}</button>
            </div>
          </div>
        </div>

        {reviewError && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{reviewError}</div>}

        {isLoadingReviews ? (
          <div className="text-center py-8 text-sm text-gray-500">{t('loadingReviews')}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">{t('noReviewsYet')}</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ProductReviewItem
                key={review.id}
                review={review}
                level={0}
                userId={userId}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                isSubmittingReview={isSubmittingReview}
                onSubmitReply={submitReply}
                onDeleteReview={deleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
