"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { Comment as CommentType } from '@/domain/entities/Comment';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslations } from 'next-intl';
import CommentItem from './comment/CommentItem';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; userName: string; userId: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const t = useTranslations('community');

  const loadComments = useCallback(async (p: number = 1) => {
    try {
      setIsLoading(true);
      const result = await postCommentContainer.getCommentsByPostIdUseCase.execute(postId, p, limit, true);

      
      const normalizeComment = (c: CommentType): CommentType => {
        const user = c.user as Record<string, unknown> | undefined;
        if (user) {
          
          const avatar = (user['avatar'] || user['image'] || user['avatarUrl']) as string | undefined;
          if (avatar && typeof avatar === 'string') {
            const updated = { ...((c.user as unknown) as Record<string, unknown>), avatar } as CommentType['user'];
            c.user = updated;
          }
          
          if (!c.user?.userName) {
            const name = (user['userName'] || user['username'] || user['name'] || user['fullName']) as string | undefined;
            if (name && typeof name === 'string') {
              const updated = { ...((c.user as unknown) as Record<string, unknown>), userName: name } as CommentType['user'];
              c.user = updated;
            }
          }
        }

        if (c.mentionedUser) {
          const mu = c.mentionedUser as Record<string, unknown>;
          const mAvatar = (mu['avatar'] || mu['image'] || mu['avatarUrl']) as string | undefined;
          if (mAvatar && typeof mAvatar === 'string') {
            c.mentionedUser = { ...(c.mentionedUser || {}), avatar: mAvatar };
          }
        }

        if (c.replies && c.replies.length > 0) {
          c.replies = c.replies.map(r => normalizeComment(r));
        }
        return c;
      };

      const normalized = result.comments.map((c: CommentType) => normalizeComment(c));

      if (p === 1) {
        setComments(normalized);
      } else {
        setComments(prev => [...prev, ...normalized]);
      }

      setPage(result.pagination.page);
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, limit]);

  const updateCommentReplies = (comments: CommentType[], commentId: string, replies: CommentType[]): CommentType[] => {
    return comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: updateCommentReplies(c.replies, commentId, replies) };
      }
      return c;
    });
  };

  const loadMoreComments = async () => {
    if (!hasMore || isLoading) return;
    const next = page + 1;
    await loadComments(next);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const comment = await postCommentContainer.createCommentUseCase.execute({
        postId,
        content: newComment.trim(),
        parentCommentId: replyingTo?.commentId,
        mentionedUserId: replyingTo?.userId,
      });
      if (replyingTo) await loadComments();
      else setComments(prev => [comment, ...prev]);
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const updateCommentLikeOptimistic = (commentsList: CommentType[], liked: boolean, likesCount: number): CommentType[] => {
      return commentsList.map(c => {
        if (c.id === commentId) {
          return { ...c, isLiked: liked, likesCount };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateCommentLikeOptimistic(c.replies, liked, likesCount) };
        }
        return c;
      });
    };

    const findAndUpdate = (commentsList: CommentType[]): { found: boolean; current?: CommentType } => {
      for (const c of commentsList) {
        if (c.id === commentId) return { found: true, current: c };
        if (c.replies) {
          const res = findAndUpdate(c.replies);
          if (res.found) return res;
        }
      }
      return { found: false };
    };

    const found = findAndUpdate(comments);
    if (!found.found || !found.current) return;

    const current = found.current;
    const optimisticLiked = !current.isLiked;
    const optimisticCount = current.likesCount + (optimisticLiked ? 1 : -1);

    setComments(prev => updateCommentLikeOptimistic(prev, optimisticLiked, optimisticCount));

    try {
      const result = await postCommentContainer.toggleLikeCommentUseCase.execute(commentId);
      setComments(prev => updateCommentLikeOptimistic(prev, result.liked, result.likesCount));
    } catch (err) {
      console.error(err);
      setComments(prev => updateCommentLikeOptimistic(prev, current.isLiked, current.likesCount));
    }
  };

  const handleReply = (commentId: string, userName: string, userId: string) => {
    setReplyingTo({ commentId, userName, userId });
    setNewComment(`@${userName} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  const toggleReplies = async (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
      const comment = findComment(comments, commentId);
      if (comment && (!comment.replies || comment.replies.length === 0) && comment.repliesCount > 0) {
        try {
          const result = await postCommentContainer.commentRepository.getReplies(commentId, 1, 10);
          const updatedComments = updateCommentReplies(comments, commentId, result.comments);
          setComments(updatedComments);
        } catch (err) {
          console.error(err);
        }
      }
    }
    setExpandedReplies(newExpanded);
  };

  const findComment = (commentsList: CommentType[], commentId: string): CommentType | null => {
    for (const c of commentsList) {
      if (c.id === commentId) return c;
      if (c.replies) {
        const found = findComment(c.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    loadComments(1);
  }, [loadComments, user?.id]);

  

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('confirmDeleteComment'))) return;
    try {
      await postCommentContainer.deleteCommentUseCase.execute(commentId);
      await loadComments();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  

  return (
    <div className="border-t border-gray-100 h-full flex flex-col">
      {!replyingTo && (
        <form onSubmit={handleSubmitComment} className="p-3 sm:p-4 bg-white sticky bottom-0 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
          <div className="flex items-start gap-2">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.userName || user.email || t('userFallback')}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {user?.userName?.charAt(0).toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || t('userFallback').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex gap-1 items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('commentPlaceholder')}
                className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isSubmitting}
              />
                <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-3 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? t('sending') : t('send')}
              </button>
            </div>
          </div>
        </form>
      )}

        <div className="px-4 pb-4 mt-4 flex-1 overflow-auto scrollbar-hide">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {t('loadingComments')}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {t('emptyComments')}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  userId={user?.id}
                  isExpanded={expandedReplies.has(comment.id)}
                  expandedReplies={expandedReplies}
                  replyingTo={replyingTo}
                  isSubmitting={isSubmitting}
                  newComment={newComment}
                  onLike={handleLikeComment}
                  onReply={handleReply}
                  onCancelReply={cancelReply}
                  onToggleReplies={toggleReplies}
                  onSubmitComment={handleSubmitComment}
                  setNewComment={setNewComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={loadMoreComments}
                  className="px-1 py-2 bg-white border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('loadMoreComments')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
