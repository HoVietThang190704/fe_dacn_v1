'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/presentation/di/container';
import { DEFAULT_SEARCH_LIMITS, useSearchViewModel } from '@/presentation/viewmodels/useSearchViewModel';
import type { SearchQueryParams } from '@/domain/repositories/ISearchRepository';
import type { Product } from '@/domain/entities/Product';
import type { Post } from '@/domain/entities/Post';
import type { User } from '@/domain/entities/User';
import ProductCard from '@/presentation/components/ProductCard';
import PostDetailModal from '@/presentation/components/PostDetailModal';

const parsePositiveNumber = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const formatDateTime = (value?: Date): string => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  } catch {
    return value.toISOString();
  }
};

type HighlightSegment = {
  value: string;
  isMatch: boolean;
};

const buildHighlightSegments = (text: string, keyword: string): HighlightSegment[] => {
  if (!keyword) {
    return [{ value: text, isMatch: false }];
  }

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexp = new RegExp(escaped, 'gi');
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regexp.exec(text)) !== null) {
    const [matchedValue] = match;
    const matchIndex = match.index;
    if (lastIndex < matchIndex) {
      segments.push({ value: text.slice(lastIndex, matchIndex), isMatch: false });
    }
    segments.push({ value: matchedValue, isMatch: true });
    lastIndex = matchIndex + matchedValue.length;
  }

  if (lastIndex < text.length) {
    segments.push({ value: text.slice(lastIndex), isMatch: false });
  }

  if (segments.length === 0) {
    return [{ value: text, isMatch: false }];
  }

  return segments;
};

interface ProductSectionProps {
  products: Product[];
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
}

const ProductsSection: React.FC<ProductSectionProps> = ({ products, hasMore, onLoadMore, total }) => {
  const t = useTranslations('search');
  return (
  <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{t('results.products', { count: total })}</h2>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          {t('results.loadMore')}
        </button>
      )}
    </div>
    {products.length === 0 ? (
      <p className="text-sm text-gray-500">{t('results.noProductsDesc')}</p>
    ) : (
  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </section>
  );
};

interface PostSectionProps {
  posts: Post[];
  keyword: string;
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
}

const PostResultCard: React.FC<{ post: Post; keyword: string; onOpen?: (id: string) => void }> = ({ post, keyword, onOpen }) => {
  const highlighted = useMemo(() => buildHighlightSegments(post.content ?? '', keyword), [post.content, keyword]);

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
            alt={post.user.userName ?? post.user.email}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            {(post.user?.userName ?? post.user?.email ?? '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {post.user?.userName ?? post.user?.email ?? 'Người dùng ẩn danh'}
          </p>
          <p className="text-xs text-gray-500">{formatDateTime(post.createdAt)}</p>
        </div>
      </header>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {highlighted.map((segment, idx) => (
          <span
            key={`${post.id}-segment-${idx}`}
            className={segment.isMatch ? 'bg-yellow-200 font-medium' : undefined}
          >
            {segment.value}
          </span>
        ))}
      </p>
      <footer className="flex gap-4 text-xs text-gray-500">
        <span>❤ {post.likesCount}</span>
        <span>💬 {post.commentsCount}</span>
        <span>🔁 {post.sharesCount}</span>
      </footer>
    </article>
  );
};

const PostsSection: React.FC<PostSectionProps & { onOpenPost?: (id: string) => void }> = ({ posts, keyword, hasMore, onLoadMore, total, onOpenPost }) => {
  const t = useTranslations('search');
  return (
  <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{t('results.posts', { count: total })}</h2>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          {t('results.loadMore')}
        </button>
      )}
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
  </section>
  );
};

interface UsersSectionProps {
  users: User[];
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
}

const UsersSection: React.FC<UsersSectionProps & { onUserClick?: (id: string) => void }> = ({ users, hasMore, onLoadMore, total, onUserClick }) => {
  const t = useTranslations('search');
  return (
  <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{t('results.users', { count: total })}</h2>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          {t('results.loadMore')}
        </button>
      )}
    </div>
    {users.length === 0 ? (
      <p className="text-sm text-gray-500">{t('results.noUsersDesc')}</p>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <article
            key={user.id}
            onClick={() => onUserClick?.(user.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onUserClick?.(user.id); }}
            className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex gap-3 hover:shadow-md cursor-pointer"
          >
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.userName ?? user.email}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-500 text-white flex items-center justify-center font-semibold">
                {(user.userName ?? user.email ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.userName ?? 'Người dùng'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {user.phone && <p className="text-xs text-gray-500 truncate">{user.phone}</p>}
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
  );
};

export const SearchPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'posts' | 'users'>('all');
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const t = useTranslations('search');

  const {
    query,
    results,
    limits,
    isLoading,
    error,
    performSearch,
    clear,
  } = useSearchViewModel(container.getSearchUseCase);

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParamsString);
    const q = urlParams.get('q') ?? '';
    setInputValue(q);

    const productsLimit = parsePositiveNumber(urlParams.get('productsLimit'));
    const postsLimit = parsePositiveNumber(urlParams.get('postsLimit'));
    const usersLimit = parsePositiveNumber(urlParams.get('usersLimit'));

    if (!q.trim()) {
      clear();
      return;
    }

  const overrides: SearchQueryParams = {};
    if (productsLimit) overrides.productsLimit = productsLimit;
    if (postsLimit) overrides.postsLimit = postsLimit;
    if (usersLimit) overrides.usersLimit = usersLimit;

    performSearch(q, overrides);
  }, [searchParamsString, performSearch, clear]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = inputValue.trim();
    const base = new URLSearchParams();
    if (keyword) {
      base.set('q', keyword);
    }
    router.push(`/${locale}/main/search${keyword ? `?${base.toString()}` : ''}`);
  };

  const updateLimit = useCallback((key: keyof Required<SearchQueryParams>, step: number) => {
    if (!query) return;
    const paramsClone = new URLSearchParams(searchParamsString);
    paramsClone.set('q', query);
    const current = parsePositiveNumber(paramsClone.get(key)) ?? limits[key] ?? DEFAULT_SEARCH_LIMITS[key];
    paramsClone.set(key, String(current + step));
    router.replace(`/${locale}/main/search?${paramsClone.toString()}`);
  }, [query, limits, router, locale, searchParamsString]);

  const products = results?.products.items ?? [];
  const posts = results?.posts.items ?? [];
  const users = results?.users.items ?? [];

  const openPostDetail = (postId: string) => {
    setOpenPostId(postId);
  };

  const closePostDetail = () => setOpenPostId(null);

  const handleUserClick = (userId: string) => {
    router.push(`/${locale}/main/users/${encodeURIComponent(userId)}`);
  };

  const totalProducts = results?.products.total ?? products.length;
  const totalPosts = results?.posts.total ?? posts.length;
  const totalUsers = results?.users.total ?? users.length;

  const hasAnyResults = products.length + posts.length + users.length > 0;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{t('title')}</h1>
              {query && (
                <p className="text-sm text-gray-500 mt-1">
                  {t('results.subtitle', { query })}
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
              <input
                type="search"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={t('placeholder')}
                className="flex-1 sm:flex-initial min-w-0 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                {t('button')}
              </button>
            </form>
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </header>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" aria-label={t('loading')} />
          </div>
        )}

        {!isLoading && query && !hasAnyResults && !error && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-500">
            {t('results.noResultsTitle')}
          </div>
        )}

        {!isLoading && hasAnyResults && (
          <div className="space-y-6">
            {/* Tabs */}
            <nav className="flex gap-2 items-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-2 rounded-md ${activeTab === 'all' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.all')}</button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 rounded-md ${activeTab === 'products' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.products')} ({totalProducts})</button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-3 py-2 rounded-md ${activeTab === 'posts' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.posts')} ({totalPosts})</button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 rounded-md ${activeTab === 'users' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.users')} ({totalUsers})</button>
            </nav>

            <div className="pt-4">
              {(activeTab === 'all' || activeTab === 'products') && (
                <ProductsSection
                  products={products}
                  hasMore={Boolean(results?.products.hasMore)}
                  onLoadMore={() => updateLimit('productsLimit', DEFAULT_SEARCH_LIMITS.productsLimit)}
                  total={totalProducts}
                />
              )}

              {(activeTab === 'all' || activeTab === 'posts') && (
                <PostsSection
                  posts={posts}
                  keyword={query}
                  hasMore={Boolean(results?.posts.hasMore)}
                  onLoadMore={() => updateLimit('postsLimit', DEFAULT_SEARCH_LIMITS.postsLimit)}
                  total={totalPosts}
                  onOpenPost={openPostDetail}
                />
              )}

              {(activeTab === 'all' || activeTab === 'users') && (
                <UsersSection
                  users={users}
                  hasMore={Boolean(results?.users.hasMore)}
                  onLoadMore={() => updateLimit('usersLimit', DEFAULT_SEARCH_LIMITS.usersLimit)}
                  total={totalUsers}
                  onUserClick={handleUserClick}
                />
              )}
            </div>
          </div>
        )}

        {openPostId && (
          <PostDetailModal postId={openPostId} isOpen={Boolean(openPostId)} onClose={closePostDetail} />
        )}

        {!isLoading && !query && !error && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-500 space-y-3">
            <p className="text-base font-medium text-gray-700">{t('empty.title')}</p>
            <p className="text-sm">{t('empty.subtitle')}</p>
            <Link
              href={`/${locale}/main`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors text-sm font-medium"
            >
              {t('empty.cta')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
