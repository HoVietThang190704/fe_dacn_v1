import React from 'react';
import Image from 'next/image';
import { CommunityPost } from '@/domain/entities/Community';

const PostCard: React.FC<{ post: CommunityPost; t: (key: string) => string }> = ({ post, t }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={post.userAvatar}
            alt={post.userName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-gray-900 truncate">{post.userName}</h3>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
                ...(new Date(post.createdAt).getFullYear() !== new Date().getFullYear() && {
                  year: 'numeric'
                })
              })}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
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
              />
              <Image
                src={post.images[1]}
                alt="Post image 2"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
              />
              <Image
                src={post.images[2]}
                alt="Post image 3"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
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
        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {post.likes > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">♥</span>
                </div>
                <span>{post.likes.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            {post.comments > 0 && <span>{post.comments.toLocaleString()} {t('comments')}</span>}
            {post.shares > 0 && <span>{post.shares.toLocaleString()} {t('shares')}</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-2 py-1 flex gap-1">
        <button
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
        <button className="flex-1 py-2 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
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
        <button className="flex-1 py-2 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
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
    </div>
  );
};

export default PostCard;