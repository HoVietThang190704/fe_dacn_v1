'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CommunityPost } from '@/domain/entities/Community';
import PostDetailModal from './PostDetailModal';
import SharePostModal from './SharePostModal';
import { useAuth } from '@/shared/hooks/useAuth';

// Options menu shown for post owner (three-dot menu with delete)
const PostOptionsMenu: React.FC<{ onDelete: () => void | Promise<void> }> = ({ onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleDelete = async () => {
    try {
      await onDelete();
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 text-gray-600"
        aria-label="Options"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-sm"
          >
            Xóa bài viết
          </button>
        </div>
      )}
    </div>
  );
};

interface PostCardProps {
  post: CommunityPost;
  t: (key: string) => string;
  onLike?: () => void | Promise<void>;
  onComment?: () => void | Promise<void>;
  onShare?: (content?: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({ post, t, onLike, onComment, onShare, onDelete }) => {
  const params = useParams();
  const locale = params.locale as string || 'vi';
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // current logged in user (used to determine ownership for options menu)
  const { user } = useAuth();

  const handleCommentClick = () => {
    // open detail modal focused on comments
    setIsDetailOpen(true);
    if (onComment) onComment();
  };

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleSharePost = async (content?: string) => {
    if (onShare) {
      await onShare(content);
    }
  };

  const openDetail = () => setIsDetailOpen(true);
  const closeDetail = () => setIsDetailOpen(false);

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày`;
    } else {
      return postDate.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

    const profileHref = (() => {
      const query = new URLSearchParams();
      if (post.userName) {
        query.set('userName', post.userName);
      }
      if (post.userEmail) {
        query.set('email', post.userEmail);
      }
      if (post.userAvatar) {
        query.set('avatar', post.userAvatar);
      }
      const queryString = query.toString();
      return `/${locale}/main/users/${encodeURIComponent(post.userId)}${queryString ? `?${queryString}` : ''}`;
    })();
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <Link
          href={profileHref}
          prefetch={false}
          className="flex items-center gap-3 group"
        >
          {post.userAvatar ? (
            <Image
              src={post.userAvatar}
              alt={post.userName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {post.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-gray-900 truncate group-hover:text-orange-500 transition-colors">{post.userName}</h3>
            <p className="text-xs text-gray-500">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </Link>
        {/* Show three-dot menu only for post owner */}
        {user?.id === post.userId && onDelete && <PostOptionsMenu onDelete={onDelete} />}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-3">
          {post.images.length === 1 ? (
            <div className="relative">
              <Image
                src={post.images[0]}
                alt="Post image"
                width={600}
                height={400}
                className="w-full max-h-96 object-cover cursor-pointer"
                onClick={() => openDetail()}
              />
            </div>
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-1">
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => openDetail()}
                />
              ))}
            </div>
          ) : post.images.length === 3 ? (
            <div className="grid grid-cols-2 gap-1">
              <Image
                src={post.images[0]}
                alt="Post image 1"
                width={300}
                height={400}
                className="w-full h-96 object-cover cursor-pointer row-span-2"
                onClick={() => openDetail()}
              />
              <Image
                src={post.images[1]}
                alt="Post image 2"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => openDetail()}
              />
              <Image
                src={post.images[2]}
                alt="Post image 3"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => openDetail()}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => openDetail()}
                  />
                  {index === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">+{post.images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Stats */}
      {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {post.likes > 0 && (
              <>
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">♥</span>
                </div>
                <span className="font-medium">{post.likes.toLocaleString()}</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            {post.comments > 0 && (
              <Link 
                href={`/${locale}/main/community/${post.id}`}
                className="hover:underline"
              >
                {post.comments.toLocaleString()} {t('comments')}
              </Link>
            )}
            {post.shares > 0 && <span>{post.shares.toLocaleString()} {t('shares')}</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-2 py-1 flex gap-1 border-b border-gray-100">
        <button
          onClick={onLike}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:bg-gray-100 ${
            post.isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <svg className="w-5 h-5" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm">{t('like')}</span>
        </button>
        <button
          onClick={handleCommentClick}
          className="flex-1 py-2 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">{t('comment')}</span>
        </button>
        <button
          onClick={handleShareClick}
          className="flex-1 py-2 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="text-sm">{t('share')}</span>
        </button>
      </div>

      {/* Comments Section (modal handles full comments) */}
      {isDetailOpen && (
        <PostDetailModal postId={post.id} isOpen={isDetailOpen} onClose={closeDetail} />
      )}

      {/* Share Modal */}
      {isShareOpen && (
        <SharePostModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          post={post}
          onShare={handleSharePost}
        />
      )}
    </div>
  );
};

export default PostCard;