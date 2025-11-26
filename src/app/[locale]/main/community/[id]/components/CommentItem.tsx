'use client';

import React from 'react';
import Image from 'next/image';
import { Comment } from '@/domain/entities/Comment';
import { useTranslations } from 'next-intl';

type Props = {
  comment: Comment;
  onLike: (commentId: string) => void;
  formatTimeAgo: (date: Date) => string;
};

export default function CommentItem({ comment, onLike, formatTimeAgo }: Props) {
  const t = useTranslations('community');

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        {comment.user?.avatar ? (
          <Image
            src={comment.user.avatar}
            alt={comment.user.userName || t('userFallback')}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {comment.user?.userName?.charAt(0).toUpperCase() || (t('userFallback')?.charAt(0)?.toUpperCase() || 'U')}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-4 py-3">
            <p className="font-semibold text-sm text-gray-900">{comment.user?.userName || t('userFallback')}</p>
            <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 px-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`text-xs font-semibold ${comment.isLiked ? 'text-red-500' : 'text-gray-500'} hover:underline`}
            >
              {t('like')} {comment.likesCount > 0 && `(${comment.likesCount})`}
            </button>
            <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
