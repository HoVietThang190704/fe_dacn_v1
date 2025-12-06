'use client';

import Image from 'next/image';
import type { CommunityPost } from '@/domain/entities/Community';
import { ICONS } from '@/shared/constants/images';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost;
  shareContent: string;
  setShareContent: (value: string) => void;
  isSharing: boolean;
  onShare: () => Promise<void>;
  t: ReturnType<typeof import('next-intl').useTranslations>;
};

export default function SharePostModalView({
  isOpen,
  onClose,
  post,
  shareContent,
  setShareContent,
  isSharing,
  onShare,
  t,
}: Props) {
  if (!isOpen) return null;

  const closeIcon = ICONS.CROSS ?? ICONS.PLACEHOLDER;
  const postImage = post.images && post.images.length > 0 ? post.images[0] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{String(t('shareModal.title'))}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSharing}
            aria-label={String(t('icons.closeAlt') ?? '')}
          >
            <Image src={closeIcon} alt={String(t('icons.closeAlt') ?? '')} width={18} height={18} unoptimized />
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            placeholder={String(t('shareModal.placeholder'))}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 min-h-[100px] resize-none"
            maxLength={1000}
            disabled={isSharing}
          />

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              {post.userAvatar ? (
                <Image
                  src={post.userAvatar}
                  alt={post.userName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {post.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{post.userName}</p>
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <p className="text-sm text-gray-800 mb-3 line-clamp-3">{post.content}</p>

            {postImage && (
              <div className="relative">
                <Image src={postImage} alt={String(t('post'))} width={400} height={300} className="w-full h-48 object-cover rounded" unoptimized />
                {post.images && post.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    +{post.images.length - 1} {String(t('photo'))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 text-right text-xs text-gray-500">{shareContent.length}/1000</div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSharing}
          >
            {String(t('cancel'))}
          </button>
          <button
            onClick={onShare}
            disabled={isSharing}
            aria-label={String(t('icons.closeAlt') ?? '')}
          >
            <Image src={closeIcon} alt={String(t('icons.closeAlt') ?? '')} width={18} height={18} unoptimized />
          </button>
        </div>
      </div>
    </div>
  );
}
