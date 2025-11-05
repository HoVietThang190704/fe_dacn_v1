'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CommunityPost } from '@/domain/entities/Community';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost;
  onShare: (content?: string) => Promise<void>;
}

export default function SharePostModal({ isOpen, onClose, post, onShare }: SharePostModalProps) {
  const [shareContent, setShareContent] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      await onShare(shareContent.trim() || undefined);
      onClose();
      setShareContent('');
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chia sẻ bài viết</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSharing}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Share Input */}
          <textarea
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 min-h-[100px] resize-none"
            maxLength={1000}
            disabled={isSharing}
          />

          {/* Original Post Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              {post.userAvatar ? (
                <Image
                  src={post.userAvatar}
                  alt={post.userName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {post.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{post.userName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-sm text-gray-800 mb-3 line-clamp-3">{post.content}</p>

            {/* Post Images Preview */}
            {post.images && post.images.length > 0 && (
              <div className="relative">
                <Image
                  src={post.images[0]}
                  alt="Post preview"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded"
                />
                {post.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    +{post.images.length - 1} ảnh
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Character Count */}
          <div className="mt-2 text-right text-xs text-gray-500">
            {shareContent.length}/1000
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSharing}
          >
            Hủy
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
          </button>
        </div>
      </div>
    </div>
  );
}
