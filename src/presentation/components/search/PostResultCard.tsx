import React, { useMemo } from 'react';
import Image from 'next/image';
import type { Post } from '@/domain/entities/Post';
import { ICONS } from '@/shared/constants/images';
import { buildHighlightSegments } from '../../pages/SearchPage.helpers';
import { useTranslations, useLocale } from 'next-intl';

interface Props {
  post: Post;
  keyword: string;
  onOpen?: (id: string) => void;
}

const PostResultCard: React.FC<Props> = ({ post, keyword, onOpen }) => {
  const t = useTranslations('search');

  const highlighted = useMemo(() => buildHighlightSegments(post.content ?? '', keyword), [post.content, keyword]);

  const locale = useLocale();

  const authorName = post.user?.userName ?? post.user?.email ?? t('userAnonymous');

  const getIcon = (key: keyof typeof ICONS) => ICONS[key] ?? ICONS.PLACEHOLDER;

  return (
    <article
      onClick={() => onOpen?.(post.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen?.(post.id); }}
      className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3 hover:shadow-md cursor-pointer"
    >
      <header className="flex items-center gap-3">
        {post.user?.avatar ? (
          <Image
            src={post.user.avatar}
            alt={authorName}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-800">{authorName}</p>
          <p className="text-xs text-gray-500">{new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'short', timeStyle: 'short' }).format(post.createdAt ?? new Date())}</p>
        </div>
      </header>

      <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {highlighted.map((segment: { value: string; isMatch: boolean }, idx: number) => (
          <span
            key={`${post.id}-segment-${idx}`}
            className={segment.isMatch ? 'bg-yellow-200 font-medium' : undefined}
          >
            {segment.value}
          </span>
        ))}
      </p>

      <footer className="flex gap-4 text-xs text-gray-500 items-center">
        <div className="flex items-center gap-1">
          <Image src={getIcon('HEART')} alt={t('post.likes')} width={14} height={14} />
          <span>{post.likesCount}</span>
        </div>

        <div className="flex items-center gap-1">
          <Image src={getIcon('CHAT')} alt={t('post.comments')} width={14} height={14} />
          <span>{post.commentsCount}</span>
        </div>

        <div className="flex items-center gap-1">
          <Image src={getIcon('SHARE')} alt={t('post.shares')} width={14} height={14} />
          <span>{post.sharesCount}</span>
        </div>
      </footer>
    </article>
  );
};

export default PostResultCard;
