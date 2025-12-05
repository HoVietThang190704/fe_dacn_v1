import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShareInfo, ShareResourceType } from '@/domain/entities/ShareInfo';
import { container } from '@/presentation/di/container';

interface UseShareInfoOptions {
  resourceType: ShareResourceType;
  resourceId?: string;
  locale?: string;
  enabled?: boolean;
}

export const useShareInfo = ({ resourceType, resourceId, locale, enabled = true }: UseShareInfoOptions) => {
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShareInfo(null);
    setError(null);
  }, [resourceId, resourceType]);

  const fetchShareInfo = useCallback(async () => {
    if (!resourceId) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (resourceType === 'post') {
        const data = await container.getPostShareInfoUseCase.execute({ postId: resourceId, locale });
        setShareInfo(data);
        return data;
      }

      const data = await container.getProductShareInfoUseCase.execute({ productId: resourceId, locale });
      setShareInfo(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setShareInfo(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, resourceType, locale]);

  useEffect(() => {
    if (!enabled || !resourceId) {
      return;
    }
    void fetchShareInfo();
  }, [enabled, resourceId, fetchShareInfo]);

  return useMemo(
    () => ({
      shareInfo,
      isLoading,
      error,
      refresh: fetchShareInfo,
      setShareInfo,
      setError,
    }),
    [shareInfo, isLoading, error, fetchShareInfo]
  );
};
