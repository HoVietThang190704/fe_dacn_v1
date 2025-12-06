"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { Post } from '@/domain/entities/Post';
import PostHeader from './components/PostHeader';
import PostImages from './components/PostImages';
import PostActions from './components/PostActions';
import { CommentSection } from '@/presentation/components/CommentSection';
import { ShareDialog } from '@/presentation/components/share/ShareDialog';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('community');
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  // comments and comment input are handled by CommentSection in this page
  const [isLoading, setIsLoading] = useState(true);
  // CommentSection will handle comment submission UI/logic in this page
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const loadPostAndComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const postData = await postCommentContainer
        .postRepository
        .getPostById(postId);
      setPost(postData);
      // Comments will be loaded by the presentation CommentSection component
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loading') || 'Unable to load post');
    } finally {
      setIsLoading(false);
    }
  }, [postId, t]);

  useEffect(() => {
    loadPostAndComments();
  }, [loadPostAndComments]);

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
      setError(err instanceof Error ? err.message : t('error') || 'Error liking post');
    }
  };



  const handleSharePost = async (content?: string) => {
    try {
      await postCommentContainer.sharePostUseCase.execute({ originalPostId: postId, content });
      if (post) setPost({ ...post, sharesCount: (post.sharesCount || 0) + 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error') || 'Error sharing post');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return t('justNow') || 'Just now';
    if (diffInSeconds < 3600) return t('minutesAgo', { count: Math.floor(diffInSeconds / 60) }) || `${Math.floor(diffInSeconds / 60)} minutes`; 
    if (diffInSeconds < 86400) return t('hoursAgo', { hours: Math.floor(diffInSeconds / 3600) }) || `${Math.floor(diffInSeconds / 3600)} hours`;
    if (diffInSeconds < 604800) return t('daysAgo', { days: Math.floor(diffInSeconds / 86400) }) || `${Math.floor(diffInSeconds / 86400)} days`;
    return commentDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || t('emptyTitle') || 'Post not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('back') || 'Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostHeader onBack={() => router.back()} userName={post.user?.userName} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white mt-2">
          <div className="p-4 flex items-center gap-3">
            {post.user?.avatar ? (
              <Image
                src={post.user.avatar}
                alt={post.user.userName || (t('userFallback') || 'User')}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.user?.userName?.charAt(0).toUpperCase() || t('userFallback')?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900">{post.user?.userName || t('unknownUser')}</h2>
              <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
            <div className="px-4 pb-4">
              <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>
            <PostImages images={post.images} />

          <PostActions
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
            isLiked={post.isLiked}
            onLike={handleLike}
            onShare={() => setIsShareOpen(true)}
          />
        </div>
        {isShareOpen && (
          <ShareDialog
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            resourceType="post"
            resourceId={postId}
            locale={params.locale as string}
            onInternalShare={async (content) => { await handleSharePost(content); setIsShareOpen(false); }}
          />
        )}

        <div className="bg-white mt-2 mb-4">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg">{t('comments')} ({post?.commentsCount || 0})</h3>
          </div>
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
}
