'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/presentation/di/container';
import { DEFAULT_SEARCH_LIMITS, useSearchViewModel } from '@/presentation/viewmodels/useSearchViewModel';
import type { SearchQueryParams } from '@/domain/repositories/ISearchRepository';
import type { User } from '@/domain/entities/User';
 
import PostDetailModal from '@/presentation/components/PostDetailModal';
import { useSearchSuggestions } from '@/shared/hooks/useSearchSuggestions';
import { SearchSuggestionDropdown } from '@/components/search/SearchSuggestionDropdown';
import type { ProductSuggestion } from '@/lib/api';

const parsePositiveNumber = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

import ProductsSection from '@/presentation/components/search/ProductsSection';
import PostsSection from '@/presentation/components/search/PostsSection';
import UsersSection from '@/presentation/components/search/UsersSection';



export const SearchPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'posts' | 'users'>('all');
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const t = useTranslations('search');
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const { suggestions: quickSuggestions, isLoading: isSuggesting, requestSuggestions, clearSuggestions } = useSearchSuggestions({ limit: 10 });

  const {
    query,
    results,
    isLoading,
    isLoadingMore,
    error,
    performSearch,
    clear,
    loadMoreProducts,
    loadMorePosts,
    loadMoreUsers,
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

  useEffect(() => {
    requestSuggestions(inputValue);
  }, [inputValue, requestSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = inputValue.trim();
    const base = new URLSearchParams();
    if (keyword) {
      base.set('q', keyword);
    }
    router.push(`/${locale}/main/search${keyword ? `?${base.toString()}` : ''}`);
    setIsSearchFocused(false);
  };

  const products = results?.products.items ?? [];
  const posts = results?.posts.items ?? [];
  const users = results?.users.items ?? [];

  const openPostDetail = (postId: string) => {
    setOpenPostId(postId);
  };

  const closePostDetail = () => setOpenPostId(null);

  const handleUserClick = (user: User) => {
    const query = new URLSearchParams();
    if (user.userName) query.set('userName', user.userName);
    if (user.email) query.set('email', user.email);
    if (user.avatar) query.set('avatar', user.avatar);
    const queryString = query.toString();
    router.push(`/${locale}/main/users/${encodeURIComponent(user.id)}${queryString ? `?${queryString}` : ''}`);
  };

  const totalProducts = results?.products.total ?? products.length;
  const totalPosts = results?.posts.total ?? posts.length;
  const totalUsers = results?.users.total ?? users.length;

  const hasAnyResults = products.length + posts.length + users.length > 0;
  const trimmedInput = inputValue.trim();
  const showInlineSuggestions = isSearchFocused && trimmedInput.length >= 1 && (isSuggesting || quickSuggestions.length > 0);

  const handleInlineSuggestionSelect = (item: ProductSuggestion) => {
    setInputValue(item.name ?? '');
    clearSuggestions();
    setIsSearchFocused(false);
    router.push(`/${locale}/main/products/${encodeURIComponent(item.id)}`);
  };

  const handleInlineViewAll = () => {
    if (!trimmedInput) return;
    const params = new URLSearchParams({ q: trimmedInput });
    router.push(`/${locale}/main/search?${params.toString()}`);
    setIsSearchFocused(false);
  };

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
              <div className="relative flex-1 sm:flex-initial" ref={inputWrapperRef}>
                <input
                  type="search"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={t('placeholder')}
                  className="flex-1 w-full min-w-0 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <SearchSuggestionDropdown
                  visible={showInlineSuggestions}
                  query={trimmedInput}
                  suggestions={quickSuggestions}
                  isLoading={isSuggesting}
                  onSelect={handleInlineSuggestionSelect}
                  onViewAll={handleInlineViewAll}
                />
              </div>
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
            
            <nav className="flex gap-2 items-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2 py-1 rounded-md ${activeTab === 'all' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.all')}</button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-2 py-1 rounded-md ${activeTab === 'products' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.products')} ({totalProducts})</button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-2 py-1 rounded-md ${activeTab === 'posts' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.posts')} ({totalPosts})</button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-2 py-1 rounded-md ${activeTab === 'users' ? 'bg-orange-500 text-white' : 'bg-white border'}`}
              >{t('tabs.users')} ({totalUsers})</button>
            </nav>

            <div className="pt-4 -mt-4">
              {(activeTab === 'all' || activeTab === 'products') && (
                <ProductsSection
                  products={products}
                  hasMore={Boolean(results?.products.hasMore)}
                  onLoadMore={() => loadMoreProducts(DEFAULT_SEARCH_LIMITS.productsLimit)}
                  total={totalProducts}
                  router={router}
                  isLoadingMore={isLoadingMore}
                />
              )}

              {(activeTab === 'all' || activeTab === 'posts') && (
                <PostsSection
                  posts={posts}
                  keyword={query}
                  hasMore={Boolean(results?.posts.hasMore)}
                  onLoadMore={() => loadMorePosts(DEFAULT_SEARCH_LIMITS.postsLimit)}
                  total={totalPosts}
                  onOpenPost={openPostDetail}
                  isLoadingMore={isLoadingMore}
                />
              )}

              {(activeTab === 'all' || activeTab === 'users') && (
                <UsersSection
                  users={users}
                  hasMore={Boolean(results?.users.hasMore)}
                  onLoadMore={() => loadMoreUsers(DEFAULT_SEARCH_LIMITS.usersLimit)}
                  total={totalUsers}
                  onUserClick={handleUserClick}
                  isLoadingMore={isLoadingMore}
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
