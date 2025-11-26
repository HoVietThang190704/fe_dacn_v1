'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchApi, type ProductSuggestion } from '@/lib/api';

interface UseSearchSuggestionsOptions {
  minCharacters?: number;
  limit?: number;
  debounceMs?: number;
}

interface UseSearchSuggestionsResult {
  suggestions: ProductSuggestion[];
  isLoading: boolean;
  requestSuggestions: (value: string) => void;
  clearSuggestions: () => void;
}

const DEFAULT_OPTIONS: Required<UseSearchSuggestionsOptions> = {
  minCharacters: 2,
  limit: 8,
  debounceMs: 250
};

export const useSearchSuggestions = (
  options?: UseSearchSuggestionsOptions
): UseSearchSuggestionsResult => {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...(options ?? {}) };
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<number | null>(null);

  const requestSuggestions = useCallback((rawValue: string) => {
    const keyword = (rawValue ?? '').trim();

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    if (keyword.length < resolvedOptions.minCharacters) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestId = ++requestIdRef.current;

    debounceRef.current = window.setTimeout(async () => {
      try {
        const items = await searchApi.suggest(keyword, resolvedOptions.limit);
        if (requestId === requestIdRef.current) {
          setSuggestions(items);
        }
      } catch (error) {
        if (requestId === requestIdRef.current) {
          setSuggestions([]);
        }
        console.error('[useSearchSuggestions] Failed to load suggestions', error);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, resolvedOptions.debounceMs) as unknown as number;
  }, [resolvedOptions.debounceMs, resolvedOptions.limit, resolvedOptions.minCharacters]);

  const clearSuggestions = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    requestIdRef.current += 1;
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    suggestions,
    isLoading,
    requestSuggestions,
    clearSuggestions
  };
};
