import React from 'react';
import Image from 'next/image';
import { ProductReview } from '@/domain/entities/ProductReview';
import { StarRatingDisplay } from '@/presentation/components/ui/StarRating';
import { formatRelativeTime } from '@/presentation/lib/formatters';
import { useTranslations } from 'next-intl';

type TranslatorFn = ReturnType<typeof useTranslations>;
interface Props {
  review: ProductReview;
  level?: number;
  userId?: string | null;
  activeReplyId: string | null;
  setActiveReplyId: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (c: string) => void;
  isSubmittingReview: boolean;
  onSubmitReply: (event: React.FormEvent<HTMLFormElement>, parent: ProductReview) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  tProducts: TranslatorFn;
  tFav: TranslatorFn;
}

export const ProductReviewItem: React.FC<Props> = ({
  review,
  level = 0,
  userId,
  activeReplyId,
  setActiveReplyId,
  replyContent,
  setReplyContent,
  isSubmittingReview,
  onSubmitReply,
  onDeleteReview,
  tProducts,
  tFav
}) => {
  const isOwner = userId === review.userId;
  const canReply = level < (Number(process.env.NEXT_PUBLIC_MAX_REVIEW_LEVELS) || 2);

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
              {tProducts('reply') || 'Trả lời'}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDeleteReview(review.id)}
              className="font-medium text-red-500 hover:text-red-600"
            >
              {tProducts('delete') || 'Xóa'}
            </button>
          )}
        </div>

        {activeReplyId === review.id && (
          <form onSubmit={(e) => onSubmitReply(e, review)} className="mt-2 flex flex-col gap-2">
            <textarea
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              rows={3}
              placeholder={tProducts('replyPlaceholder') || 'Viết phản hồi của bạn...'}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              disabled={isSubmittingReview}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (tProducts('loading') || 'Đang gửi...') : (tProducts('submit') || 'Gửi phản hồi')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveReplyId(null);
                  setReplyContent('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                {tProducts('cancel') || 'Hủy'}
              </button>
            </div>
          </form>
        )}

        {Array.isArray(review.replies) && review.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {review.replies.map((child) => (
              <ProductReviewItem
                key={child.id}
                review={child}
                level={(level || 0) + 1}
                userId={userId}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                isSubmittingReview={isSubmittingReview}
                onSubmitReply={onSubmitReply}
                onDeleteReview={onDeleteReview}
                tProducts={tProducts}
                tFav={tFav}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewItem;
