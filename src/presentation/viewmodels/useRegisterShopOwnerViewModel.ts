"use client";

import { useCallback, useEffect, useState } from 'react';
import { RegisterShopOwnerRequest } from '@/domain/entities/RegisterShopOwnerRequest';
import { GetMyRegisterShopOwnerRequestUseCase } from '@/domain/usecases/registerShopOwner/GetMyRegisterShopOwnerRequestUseCase';
import { SubmitRegisterShopOwnerRequestUseCase } from '@/domain/usecases/registerShopOwner/SubmitRegisterShopOwnerRequestUseCase';

export const useRegisterShopOwnerViewModel = (
  getMyRequestUseCase: GetMyRegisterShopOwnerRequestUseCase,
  submitRequestUseCase: SubmitRegisterShopOwnerRequestUseCase
) => {
  const [request, setRequest] = useState<RegisterShopOwnerRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMyRequestUseCase.execute();
      setRequest(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load request';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getMyRequestUseCase]);

  const submit = useCallback(async (file: File) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await submitRequestUseCase.execute({ certificate: file });
      setRequest(result);
      return { success: true, data: result } as const;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to submit request';
      setError(message);
      return { success: false, error: message } as const;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitRequestUseCase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    request,
    isLoading,
    isSubmitting,
    error,
    refresh,
    submit
  };
};
