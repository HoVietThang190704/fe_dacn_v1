'use client';

import { useState, useEffect, useCallback } from 'react';
import { GetCommunityPostsUseCase } from '@/domain/usecases/GetCommunityPostsUseCase';
import { CreateCommunityPostUseCase } from '@/domain/usecases/CreateCommunityPostUseCase';
import { CommunityPost } from '@/domain/entities/Community';
import { CreatePostDto } from '@/domain/repositories/ICommunityRepository';

export const useCommunityViewModel = (
  getCommunityPostsUseCase: GetCommunityPostsUseCase,
  createCommunityPostUseCase: CreateCommunityPostUseCase
) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const loadPosts = useCallback(async (pageNum: number = 1) => {
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
  }, [getCommunityPostsUseCase]);

  const createPost = async (postData: CreatePostDto): Promise<CommunityPost> => {
    try {
      setIsCreatingPost(true);
      setError(null);
      const newPost = await createCommunityPostUseCase.execute(postData);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreatingPost(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

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
    createPost,
    isCreatingPost,
  };
};
