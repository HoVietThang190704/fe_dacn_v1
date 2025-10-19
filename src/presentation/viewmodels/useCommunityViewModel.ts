'use client';

import { useState, useEffect } from 'react';
import { GetCommunityPostsUseCase } from '@/domain/usecases/GetCommunityPostsUseCase';
import { CommunityPost } from '@/domain/entities/Community';

export const useCommunityViewModel = (getCommunityPostsUseCase: GetCommunityPostsUseCase) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCommunityPostsUseCase.execute(pageNum, 10);
      
      if (pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1);
    }
  };

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh: () => loadPosts(1),
  };
};
