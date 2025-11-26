'use client';

import { useCallback, useRef, useState } from 'react';
import type { SearchResults } from '@/domain/entities/Search';
import type { SearchQueryParams } from '@/domain/repositories/ISearchRepository';
import { SearchUseCase } from '@/domain/usecases/SearchUseCase';

export const DEFAULT_SEARCH_LIMITS: Required<SearchQueryParams> = {
  productsLimit: 10,
  postsLimit: 5,
  usersLimit: 6,
};

const mergeLimits = (
  base: SearchQueryParams,
  current: SearchQueryParams,
  override?: SearchQueryParams
): SearchQueryParams => ({
  ...base,
  ...current,
  ...override,
});

export const useSearchViewModel = (searchUseCase: SearchUseCase) => {
  const baseLimitsRef = useRef<SearchQueryParams>({ ...DEFAULT_SEARCH_LIMITS });
  const limitsRef = useRef<SearchQueryParams>({ ...DEFAULT_SEARCH_LIMITS });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [limits, setLimits] = useState<SearchQueryParams>({ ...DEFAULT_SEARCH_LIMITS });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (rawQuery: string, override?: SearchQueryParams) => {
    const keyword = (rawQuery ?? '').trim();
    if (!keyword) {
      setQuery('');
      setResults(null);
      setError(null);
      return;
    }

    const mergedLimits = mergeLimits(baseLimitsRef.current, limitsRef.current, override);

    try {
      setIsLoading(true);
      setError(null);
      const payload = await searchUseCase.execute(keyword, mergedLimits);
      setResults(payload);
      setQuery(keyword);
      setLimits(mergedLimits);
      limitsRef.current = mergedLimits;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tìm kiếm dữ liệu, vui lòng thử lại sau.';
      setError(message);
      console.error('[useSearchViewModel] performSearch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchUseCase]);

  const refresh = useCallback(async () => {
    if (!query) return;
    await performSearch(query);
  }, [query, performSearch]);

  const clear = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    const resetLimits = { ...DEFAULT_SEARCH_LIMITS };
    limitsRef.current = resetLimits;
    setLimits(resetLimits);
  }, []);

  const loadMoreProducts = useCallback(async (step: number = DEFAULT_SEARCH_LIMITS.productsLimit) => {
    if (!query) return;
    const currentLimit = limitsRef.current.productsLimit ?? DEFAULT_SEARCH_LIMITS.productsLimit;
    const nextLimit = currentLimit + step;
    await performSearch(query, { productsLimit: nextLimit });
  }, [performSearch, query]);

  const loadMorePosts = useCallback(async (step: number = DEFAULT_SEARCH_LIMITS.postsLimit) => {
    if (!query) return;
    const currentLimit = limitsRef.current.postsLimit ?? DEFAULT_SEARCH_LIMITS.postsLimit;
    const nextLimit = currentLimit + step;
    await performSearch(query, { postsLimit: nextLimit });
  }, [performSearch, query]);

  const loadMoreUsers = useCallback(async (step: number = DEFAULT_SEARCH_LIMITS.usersLimit) => {
    if (!query) return;
    const currentLimit = limitsRef.current.usersLimit ?? DEFAULT_SEARCH_LIMITS.usersLimit;
    const nextLimit = currentLimit + step;
    await performSearch(query, { usersLimit: nextLimit });
  }, [performSearch, query]);

  return {
    query,
    results,
    limits,
    isLoading,
    error,
    performSearch,
    loadMoreProducts,
    loadMorePosts,
    loadMoreUsers,
    refresh,
    clear,
  };
};
