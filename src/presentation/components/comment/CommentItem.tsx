import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { Comment as CommentType } from '@/domain/entities/Comment';
import { useTranslations } from 'next-intl';

type CommentItemProps = {
  comment: CommentType;
  userId?: string;
  isExpanded: boolean;
  expandedReplies: Set<string>;
  replyingTo?: { commentId: string; userName: string; userId: string } | null;
  isSubmitting: boolean;
  newComment: string;
  onLike: (id: string) => void;
  onReply: (id: string, userName: string, userId: string) => void;
  onCancelReply: () => void;
  onToggleReplies: (commentId: string) => Promise<void> | void;
  onSubmitComment: (e: React.FormEvent) => Promise<void> | void;
  setNewComment: (s: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  userId,
  isExpanded,
  expandedReplies,
  replyingTo,
  isSubmitting,
  newComment,
  onLike,
  onReply,
  onCancelReply,
  onDelete,
  onToggleReplies,
  onSubmitComment,
  setNewComment,
}) => {
  const t = useTranslations('community');

  const initials = comment.user?.userName?.charAt(0).toUpperCase() || 'U';

  const apiUser = comment.user as Record<string, unknown> | undefined;
  const avatarCandidate = apiUser?.avatar || apiUser?.image || apiUser?.avatarUrl;
  const avatar = typeof avatarCandidate === 'string' && avatarCandidate.length > 0 ? avatarCandidate : ICONS.PLACEHOLDER;
  const showAvatarImage = avatar !== ICONS.PLACEHOLDER;

  const formatTimeAgo = (date?: Date | string) => {
    if (!date) return '';
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    if (diffInSeconds < 60) return t('justNow');
    if (diffInSeconds < 3600) return t('minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('hoursAgo', { hours: Math.floor(diffInSeconds / 3600) });
    return t('daysAgo', { days: Math.floor(diffInSeconds / 86400) });
  };

  const contentWithMention = () => {
    const content = comment.content || '';
    if (comment.mentionedUser && comment.mentionedUser.userName) {
      const mention = `@${comment.mentionedUser.userName}`;
      const parts = content.split(new RegExp(`(${mention})`, 'g'));
      return (
        <>
          {parts.map((part, idx) =>
            part === mention ? (
              <span key={idx} className="text-blue-600 font-semibold">
                {part}
              </span>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </>
      );
    }
    return <>{content}</>;
  };

  return (
    <div key={comment.id} className={`flex items-start gap-2 ${comment.level > 0 ? 'ml-1 sm:ml-5' : ''}`}>
      {showAvatarImage ? (
        <Image
          src={avatar}
          alt={comment.user?.userName || t('userFallback')}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2">
          <p className="font-semibold text-sm text-gray-900">{comment.user?.userName || t('userFallback')}</p>
          <p className="text-sm text-gray-800">{contentWithMention()}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-3 flex-wrap">
          <button onClick={() => onLike(comment.id)} className={`flex items-center gap-1 text-xs font-semibold ${comment.isLiked ? 'text-red-500' : 'text-gray-500'} hover:underline`}>
            {ICONS.HEART ? (
              <Image src={comment.isLiked ? ICONS.HEART_SELECT || ICONS.HEART : ICONS.HEART} alt={t('like')} width={14} height={14} className="w-3 h-3" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21s-7-4.35-9-7.5C1.5 9.75 4 6 7.5 6 9.24 6 11 7.1 12 8.5c1-1.4 2.76-2.5 4.5-2.5C20 6 22.5 9.75 21 13.5 19 16.65 12 21 12 21z" />
              </svg>
            )}
            <span>{t('like')}</span>
            {comment.likesCount > 0 && <span className="text-xs">({comment.likesCount})</span>}
          </button>
          {comment.level < 2 && (
            <button onClick={() => onReply(comment.id, comment.user?.userName || t('userFallback'), comment.userId)} className="text-xs font-semibold text-gray-500 hover:underline">
              {t('reply')}
            </button>
          )}
          {userId && comment.userId === userId && (
            <button onClick={async () => {
              if (!confirm(t('confirmDeleteComment'))) return;
                if (onDelete) {
                  await onDelete(comment.id);
                }
              }} className="text-xs font-semibold text-red-500 hover:underline">
              {t('delete')}
            </button>
          )}
          {comment.repliesCount > 0 && (
            <button onClick={() => onToggleReplies(comment.id)} className="text-xs font-semibold text-blue-600 hover:underline">
              {isExpanded ? t('hide') : t('viewReplies', { count: comment.repliesCount })}
            </button>
          )}
          <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
        </div>

        {replyingTo?.commentId === comment.id && (
          <form onSubmit={onSubmitComment} className="mt-2 flex flex-col sm:flex-row items-start gap-2">
            {comment.user?.avatar ? (
              <Image src={comment.user.avatar} alt={comment.user.userName || comment.user.email || t('userFallback')} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {comment.user?.userName?.charAt(0).toUpperCase() || comment.user?.email?.charAt(0)?.toUpperCase() || t('userFallback').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t('replyPlaceholder')} className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" disabled={isSubmitting} />
              <button type="submit" disabled={!newComment.trim() || isSubmitting} className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? t('sending') : t('send')}
              </button>
              <button type="button" onClick={onCancelReply} className="px-3 py-1 text-gray-600 rounded-full hover:bg-gray-100">{t('cancel')}</button>
            </div>
          </form>
        )}

        {isExpanded && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} userId={userId} isExpanded={expandedReplies.has(reply.id)} expandedReplies={expandedReplies} replyingTo={replyingTo} isSubmitting={isSubmitting} newComment={newComment} onLike={onLike} onReply={onReply} onCancelReply={onCancelReply} onToggleReplies={onToggleReplies} onSubmitComment={onSubmitComment} setNewComment={setNewComment} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
