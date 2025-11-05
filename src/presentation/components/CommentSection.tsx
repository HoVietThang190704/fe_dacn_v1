'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { Comment as CommentType } from '@/domain/entities/Comment';
import { useAuth } from '@/shared/hooks/useAuth';

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

  const loadComments = useCallback(async (p: number = 1) => {
    try {
      setIsLoading(true);
      // Load nested comments to ensure replies (level 2/3) are included
      const result = await postCommentContainer
        .getCommentsByPostIdUseCase
        .execute(postId, p, limit, true);

      if (p === 1) {
        setComments(result.comments);
      } else {
        setComments(prev => [...prev, ...result.comments]);
      }

      setPage(result.pagination.page);
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, limit]);

  // Reload comments when auth user changes (so isLiked is resolved server-side)
  useEffect(() => {
    loadComments(1);
  }, [loadComments, user?.id]);

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
      const comment = await postCommentContainer
        .createCommentUseCase
        .execute({
          postId,
          content: newComment.trim(),
          parentCommentId: replyingTo?.commentId,
          mentionedUserId: replyingTo?.userId,
        });
      
      if (replyingTo) {
        // Reload to get nested structure
        await loadComments();
      } else {
        setComments([comment, ...comments]);
      }
      
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error creating comment:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi tạo bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    // Optimistic UI: toggle like locally immediately, then call API and reconcile
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

    // Find current comment
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

    // Apply optimistic update
    setComments(prev => updateCommentLikeOptimistic(prev, optimisticLiked, optimisticCount));

    try {
      const result = await postCommentContainer
        .toggleLikeCommentUseCase
        .execute(commentId);

      // Reconcile with server result
      setComments(prev => updateCommentLikeOptimistic(prev, result.liked, result.likesCount));
    } catch (err) {
      console.error('Error liking comment:', err);
      // Revert optimistic change on error
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
      // Load replies if not loaded yet
      const comment = findComment(comments, commentId);
      if (comment && (!comment.replies || comment.replies.length === 0) && comment.repliesCount > 0) {
        try {
          const result = await postCommentContainer.commentRepository.getReplies(commentId, 1, 10);
          const updatedComments = updateCommentReplies(comments, commentId, result.comments);
          setComments(updatedComments);
        } catch (err) {
          console.error('Error loading replies:', err);
        }
      }
    }
    setExpandedReplies(newExpanded);
  };

  const findComment = (comments: CommentType[], commentId: string): CommentType | null => {
    for (const c of comments) {
      if (c.id === commentId) return c;
      if (c.replies) {
        const found = findComment(c.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    return `${Math.floor(diffInSeconds / 86400)} ngày`;
  };

  const renderContentWithMention = (comment: CommentType) => {
    const content = comment.content || '';

    // If backend provides mentionedUser, highlight exact @username occurrences
    if (comment.mentionedUser && comment.mentionedUser.userName) {
      const mention = `@${comment.mentionedUser.userName}`;
      const parts = content.split(new RegExp(`(${mention})`, 'g'));

      return (
        <>
          {parts.map((part, idx) =>
            part === mention ? (
              <span key={idx} className="text-blue-600 font-semibold">{part}</span>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </>
      );
    }

    // Fallback: render raw content
    return <>{content}</>;
  };

  const renderComment = (comment: CommentType): React.ReactNode => {
    const isExpanded = expandedReplies.has(comment.id);
    
    return (
      <div key={comment.id} className={`flex items-start gap-2 ${comment.level > 0 ? 'ml-10' : ''}`}>
        {comment.user?.avatar ? (
          <Image
            src={comment.user.avatar}
            alt={comment.user.userName || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {comment.user?.userName?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-3 py-2">
            <p className="font-semibold text-sm text-gray-900">
              {comment.user?.userName || 'Người dùng'}
            </p>
            <p className="text-sm text-gray-800">
              {renderContentWithMention(comment)}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1 px-3">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-1 text-xs font-semibold ${
                comment.isLiked ? 'text-red-500' : 'text-gray-500'
              } hover:underline`}
            >
              {/* simple heart icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21s-7-4.35-9-7.5C1.5 9.75 4 6 7.5 6 9.24 6 11 7.1 12 8.5c1-1.4 2.76-2.5 4.5-2.5C20 6 22.5 9.75 21 13.5 19 16.65 12 21 12 21z" />
              </svg>
              <span>Thích</span>
              {comment.likesCount > 0 && <span className="text-xs">({comment.likesCount})</span>}
            </button>
            {comment.level < 2 && (
              <button
                onClick={() => handleReply(comment.id, comment.user?.userName || 'User', comment.userId)}
                className="text-xs font-semibold text-gray-500 hover:underline"
              >
                Trả lời
              </button>
            )}
            {/* Delete button - only for comment owner */}
            {user && comment.userId === user.id && (
              <button
                onClick={async () => {
                  if (!confirm('Bạn có chắc muốn xóa bình luận này? (các trả lời con sẽ bị xóa)')) return;
                  try {
                    await postCommentContainer.deleteCommentUseCase.execute(comment.id);
                    // Refresh nested comments to keep counts consistent
                    await loadComments();
                  } catch (err) {
                    console.error('Error deleting comment:', err);
                    alert(err instanceof Error ? err.message : 'Lỗi khi xóa bình luận');
                  }
                }}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Xóa
              </button>
            )}
            {comment.repliesCount > 0 && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {isExpanded ? 'Ẩn' : `Xem ${comment.repliesCount} câu trả lời`}
              </button>
            )}
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Inline reply input shown under the specific comment when replyingTo matches */}
          {replyingTo?.commentId === comment.id && (
            <form
              onSubmit={handleSubmitComment}
              className="mt-2 flex items-start gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                A
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Trả lời @${replyingTo.userName}`}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '...' : 'Gửi'}
                </button>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="px-3 py-1 text-gray-600 rounded-full hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {isExpanded && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => renderComment(reply))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-gray-100">
      {/* Comment Input (global) - hidden while replying inline */}
      {!replyingTo && (
        <form onSubmit={handleSubmitComment} className="p-4">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              A
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '...' : 'Gửi'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {comments.map((comment) => renderComment(comment))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={loadMoreComments}
                  className="px-4 py-2 bg-white border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Tải thêm bình luận
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
