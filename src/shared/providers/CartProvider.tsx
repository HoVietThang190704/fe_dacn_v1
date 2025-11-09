'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { container } from '@/presentation/di/container';
import { useCartViewModel, CartViewModel } from '@/presentation/viewmodels/useCartViewModel';

const CartContext = createContext<CartViewModel | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const dependencies = useMemo(
    () => ({
      getCartUseCase: container.getCartUseCase,
      addCartItemUseCase: container.addCartItemUseCase,
      updateCartItemUseCase: container.updateCartItemUseCase,
      removeCartItemUseCase: container.removeCartItemUseCase,
      clearCartUseCase: container.clearCartUseCase,
    }),
    []
  );

  const viewModel = useCartViewModel(dependencies);
  const { loadCart, resetCart, lastActionMessage, setLastActionMessage } = viewModel;

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        if (event.newValue) {
          void loadCart();
        } else {
          resetCart();
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadCart, resetCart]);

  useEffect(() => {
    if (!lastActionMessage) return;
    const timeout = window.setTimeout(() => {
      setLastActionMessage(null);
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [lastActionMessage, setLastActionMessage]);

  return <CartContext.Provider value={viewModel}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartViewModel {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
