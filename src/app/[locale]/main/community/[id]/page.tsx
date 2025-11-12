'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { Post } from '@/domain/entities/Post';
import { Comment } from '@/domain/entities/Comment';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('community');
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPostAndComments();
  }, [postId]);

  const loadPostAndComments = async () => {
    try {
      setIsLoading(true);
      const postData = await postCommentContainer
        .postRepository
        .getPostById(postId);
      setPost(postData);
      const commentsData = await postCommentContainer
        .getCommentsByPostIdUseCase
        .execute(postId, 1, 100);
      setComments(commentsData.comments);
      
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const result = await postCommentContainer
        .toggleLikePostUseCase
        .execute(postId);
      
      setPost({
        ...post,
        isLiked: result.liked,
        likesCount: result.likesCount
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
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
        });
      
      setComments([comment, ...comments]);
      setNewComment('');
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi tạo bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await postCommentContainer
        .toggleLikeCommentUseCase
        .execute(commentId);
      
      setComments(comments.map(c =>
        c.id === commentId
          ? { ...c, isLiked: result.liked, likesCount: result.likesCount }
          : c
      ));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày`;
    return commentDate.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Không tìm thấy bài viết'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Bài viết của {post.user?.userName || 'Người dùng'}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white mt-2">
          <div className="p-4 flex items-center gap-3">
            {post.user?.avatar ? (
              <Image
                src={post.user.avatar}
                alt={post.user.userName || 'User'}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.user?.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900">{post.user?.userName || 'Unknown User'}</h2>
              <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>
          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              {post.images.length === 1 ? (
                <Image
                  src={post.images[0]}
                  alt="Post image"
                  width={800}
                  height={600}
                  className="w-full object-contain max-h-[600px]"
                />
              ) : (
                <div className={`grid gap-1 ${post.images.length === 2 ? 'grid-cols-2' : post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {post.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-4 py-3 border-y border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {post.likesCount > 0 && (
                <>
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">♥</span>
                  </div>
                  <span>{post.likesCount.toLocaleString()}</span>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <span>{post.commentsCount.toLocaleString()} bình luận</span>
              {post.sharesCount > 0 && <span>{post.sharesCount.toLocaleString()} chia sẻ</span>}
            </div>
          </div>
          <div className="px-2 py-2 flex gap-1 border-b border-gray-200">
            <button
              onClick={handleLike}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:bg-gray-100 ${
                post.isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Thích</span>
            </button>
          </div>
        </div>

        <div className="bg-white mt-2 mb-4">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg">Tất cả bình luận ({comments.length})</h3>
          </div>
          <form onSubmit={handleSubmitComment} className="p-4 border-b border-gray-200 flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
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
                className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '...' : 'Gửi'}
              </button>
            </div>
          </form>
          <div className="divide-y divide-gray-100">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    {comment.user?.avatar ? (
                      <Image
                        src={comment.user.avatar}
                        alt={comment.user.userName || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.user?.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <p className="font-semibold text-sm text-gray-900">
                          {comment.user?.userName || 'Người dùng'}
                        </p>
                        <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 px-4">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`text-xs font-semibold ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-500'
                          } hover:underline`}
                        >
                          Thích {comment.likesCount > 0 && `(${comment.likesCount})`}
                        </button>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
