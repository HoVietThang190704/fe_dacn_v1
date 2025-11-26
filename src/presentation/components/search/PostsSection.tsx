import React from 'react';
import type { Post } from '@/domain/entities/Post';
import PostResultCard from './PostResultCard';
import { useTranslations } from 'next-intl';

interface PostSectionProps {
  posts: Post[];
  keyword: string;
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
  onOpenPost?: (id: string) => void;
}

const PostsSection: React.FC<PostSectionProps> = ({ posts, keyword, hasMore, onLoadMore, total, onOpenPost }) => {
  const t = useTranslations('search');

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{t('results.posts', { count: total })}</h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">{t('results.noPostsDesc')}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {posts.map((post) => (
            <PostResultCard key={post.id} post={post} keyword={keyword} onOpen={onOpenPost} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 border rounded"
          >
            {t('results.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};

export default PostsSection;
