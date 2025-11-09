'use client';

import { useState, useEffect, useCallback } from 'react';
import { GetProductByIdUseCase } from '@/domain/usecases/GetProductByIdUseCase';
import { Product } from '@/domain/entities/Product';
import { GetProductReviewsUseCase } from '@/domain/usecases/GetProductReviewsUseCase';
import { CreateProductReviewUseCase } from '@/domain/usecases/CreateProductReviewUseCase';
import { UpdateProductReviewUseCase } from '@/domain/usecases/UpdateProductReviewUseCase';
import { DeleteProductReviewUseCase } from '@/domain/usecases/DeleteProductReviewUseCase';
import {
  PaginatedProductReviews,
  ProductReview,
  ProductReviewSummary
} from '@/domain/entities/ProductReview';
import {
  CreateProductReviewPayload,
  UpdateProductReviewPayload
} from '@/domain/repositories/IProductReviewRepository';

const DEFAULT_REVIEW_PAGE_SIZE = 5;

type Dependencies = {
  getProductByIdUseCase: GetProductByIdUseCase;
  getProductReviewsUseCase: GetProductReviewsUseCase;
  createProductReviewUseCase: CreateProductReviewUseCase;
  updateProductReviewUseCase: UpdateProductReviewUseCase;
  deleteProductReviewUseCase: DeleteProductReviewUseCase;
};

export const useProductDetailViewModel = (deps: Dependencies, productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary>({
    average: 0,
    totalReviews: 0,
    distribution: {}
  });
  const [reviewsPagination, setReviewsPagination] = useState<PaginatedProductReviews['pagination']>({
    total: 0,
    page: 1,
    limit: DEFAULT_REVIEW_PAGE_SIZE,
    totalPages: 1,
    hasMore: false
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoadingProduct(true);
      setProductError(null);
      const productData = await deps.getProductByIdUseCase.execute(productId);
      setProduct(productData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load product';
      setProductError(message);
      console.error('Error loading product:', err);
    } finally {
      setIsLoadingProduct(false);
    }
  }, [deps.getProductByIdUseCase, productId]);

  const loadReviews = useCallback(
    async (page: number = 1, limit: number = DEFAULT_REVIEW_PAGE_SIZE) => {
      try {
        setIsLoadingReviews(true);
        setReviewError(null);
        const response = await deps.getProductReviewsUseCase.execute({
          productId,
          page,
          limit
        });

        setReviews(response.reviews);
        setReviewSummary(response.summary);
        setReviewsPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load reviews';
        setReviewError(message);
        console.error('Error loading product reviews:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    },
    [deps.getProductReviewsUseCase, productId]
  );

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const handleReviewAction = useCallback(async (action: () => Promise<void>, nextPage?: number) => {
    try {
      setIsSubmittingReview(true);
      await action();
      const pageToLoad = nextPage ?? reviewsPagination.page;
      await loadReviews(pageToLoad);
    } finally {
      setIsSubmittingReview(false);
    }
  }, [loadReviews, reviewsPagination.page]);

  const submitReview = useCallback(
    async (payload: Omit<CreateProductReviewPayload, 'productId'>) => {
      await handleReviewAction(async () => {
        await deps.createProductReviewUseCase.execute({
          ...payload,
          productId
        });
      }, 1);
    },
    [deps.createProductReviewUseCase, handleReviewAction, productId]
  );

  const submitReply = useCallback(
    async (payload: Omit<CreateProductReviewPayload, 'productId' | 'rating'>) => {
      await handleReviewAction(async () => {
        await deps.createProductReviewUseCase.execute({
          ...payload,
          productId
        });
      });
    },
    [deps.createProductReviewUseCase, handleReviewAction, productId]
  );

  const updateReview = useCallback(
    async (payload: UpdateProductReviewPayload) => {
      await handleReviewAction(async () => {
        await deps.updateProductReviewUseCase.execute(payload);
      });
    },
    [deps.updateProductReviewUseCase, handleReviewAction]
  );

  const deleteReview = useCallback(
    async (reviewId: string) => {
      await handleReviewAction(async () => {
        await deps.deleteProductReviewUseCase.execute({ reviewId });
      });
    },
    [deps.deleteProductReviewUseCase, handleReviewAction]
  );

  const changeReviewPage = useCallback(
    async (page: number) => {
      await loadReviews(page);
    },
    [loadReviews]
  );

  return {
    product,
    isLoadingProduct,
    productError,
    refreshProduct: loadProduct,
    reviews,
    reviewSummary,
    reviewsPagination,
    isLoadingReviews,
    reviewError,
    refreshReviews: loadReviews,
    submitReview,
    submitReply,
    updateReview,
    deleteReview,
    changeReviewPage,
    isSubmittingReview
  };
};