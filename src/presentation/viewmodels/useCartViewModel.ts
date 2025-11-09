"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cart } from '@/domain/entities/Cart';
import {
  AddCartItemPayload,
  UpdateCartItemPayload,
} from '@/domain/repositories/ICartRepository';
import { GetCartUseCase } from '@/domain/usecases/cart/GetCartUseCase';
import { AddCartItemUseCase } from '@/domain/usecases/cart/AddCartItemUseCase';
import { UpdateCartItemUseCase } from '@/domain/usecases/cart/UpdateCartItemUseCase';
import { RemoveCartItemUseCase } from '@/domain/usecases/cart/RemoveCartItemUseCase';
import { ClearCartUseCase } from '@/domain/usecases/cart/ClearCartUseCase';

export interface CartViewModelDependencies {
  getCartUseCase: GetCartUseCase;
  addCartItemUseCase: AddCartItemUseCase;
  updateCartItemUseCase: UpdateCartItemUseCase;
  removeCartItemUseCase: RemoveCartItemUseCase;
  clearCartUseCase: ClearCartUseCase;
}

export interface CartViewModel {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  lastActionMessage: string | null;
  pendingItemId: string | null;
  selectedIds: Set<string>;
  totalQuantity: number;
  subtotal: number;
  loadCart: () => Promise<void>;
  addItem: (payload: AddCartItemPayload) => Promise<void>;
  updateItem: (itemId: string, payload: UpdateCartItemPayload) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  setError: (message: string | null) => void;
  setLastActionMessage: (message: string | null) => void;
  setSelectedIds: (ids: Set<string>) => void;
}

const hasAuthToken = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken')
  );
};

export function useCartViewModel(deps: CartViewModelDependencies): CartViewModel {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cartSelectedIds');
      if (saved) {
        try {
          const ids = JSON.parse(saved);
          return new Set(ids);
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });

  // Save selectedIds to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartSelectedIds', JSON.stringify(Array.from(selectedIds)));
    }
  }, [selectedIds]);

  const totalQuantity = useMemo(() => {
    return cart?.items.reduce((total, item) => total + (item.quantity || 0), 0) ?? 0;
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart?.items.reduce((total, item) => {
      const price = item.price ?? 0;
      return total + price * (item.quantity || 0);
    }, 0) ?? 0;
  }, [cart]);

  const loadCart = useCallback(async () => {
    if (!hasAuthToken()) {
      setCart(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await deps.getCartUseCase.execute();
      setCart(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải giỏ hàng';
      setError(message);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [deps]);

  const addItem = useCallback(
    async (payload: AddCartItemPayload) => {
      if (!hasAuthToken()) {
        setError('Bạn cần đăng nhập để sử dụng giỏ hàng');
        return;
      }

      setIsMutating(true);
      setError(null);
      try {
        const updated = await deps.addCartItemUseCase.execute(payload);
        setCart(updated);
        setLastActionMessage('added_to_cart');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng';
        setError(message);
        setLastActionMessage(null);
      } finally {
        setIsMutating(false);
      }
    },
    [deps]
  );

  const updateItem = useCallback(
    async (itemId: string, payload: UpdateCartItemPayload) => {
      if (!hasAuthToken()) {
        setError('Bạn cần đăng nhập để sử dụng giỏ hàng');
        return;
      }

      setIsMutating(true);
      setPendingItemId(itemId);
      setError(null);
      try {
        const updated = await deps.updateCartItemUseCase.execute(itemId, payload);
        setCart(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể cập nhật sản phẩm trong giỏ hàng';
        setError(message);
      } finally {
        setIsMutating(false);
        setPendingItemId(null);
      }
    },
    [deps]
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      await updateItem(itemId, { quantity });
    },
    [updateItem]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!hasAuthToken()) {
        setError('Bạn cần đăng nhập để sử dụng giỏ hàng');
        return;
      }

      setIsMutating(true);
      setPendingItemId(itemId);
      setError(null);
      try {
        const updated = await deps.removeCartItemUseCase.execute(itemId);
        setCart(updated);
        setLastActionMessage('removed_from_cart');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể xóa sản phẩm khỏi giỏ hàng';
        setError(message);
      } finally {
        setIsMutating(false);
        setPendingItemId(null);
      }
    },
    [deps]
  );

  const clearCart = useCallback(async () => {
    if (!hasAuthToken()) {
      setError('Bạn cần đăng nhập để sử dụng giỏ hàng');
      return;
    }

    setIsMutating(true);
    setError(null);
    try {
      await deps.clearCartUseCase.execute();
      if (cart) {
        setCart({
          ...cart,
          items: [],
          updatedAt: new Date().toISOString(),
        });
      } else {
        setCart(null);
      }
      setLastActionMessage('cleared_cart');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa giỏ hàng';
      setError(message);
    } finally {
      setIsMutating(false);
    }
  }, [deps, cart]);

  const resetCart = useCallback(() => {
    setCart(null);
    setError(null);
    setLastActionMessage(null);
    setPendingItemId(null);
    setSelectedIds(new Set());
  }, []);

  return {
    cart,
    isLoading,
    isMutating,
    error,
    lastActionMessage,
    pendingItemId,
    selectedIds,
    totalQuantity,
    subtotal,
    loadCart,
    addItem,
    updateItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    resetCart,
    setError,
    setLastActionMessage,
    setSelectedIds,
  };
}
