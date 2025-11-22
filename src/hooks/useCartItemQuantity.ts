import { CartItem } from '@/domain/entities/Cart';
import { CART_CONFIG } from '@/lib/config';

interface UseCartItemQuantityProps {
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useCartItemQuantity = ({ updateItemQuantity, setError }: UseCartItemQuantityProps) => {
  const parseStock = (v: unknown) => {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      return Math.floor(v);
    }
    return undefined;
  };

  const handleQuantityChange = async (item: CartItem, delta: number, t: (key: string, values?: Record<string, string | number | Date>) => string) => {
    const maxAvailable = parseStock(item.attrs?.stock) ?? CART_CONFIG.MAX_STOCK_DEFAULT;
    const requested = item.quantity + delta;
    const nextQuantity = Math.max(1, Math.min(maxAvailable, requested));
    if (nextQuantity === item.quantity) {
      if (delta > 0) {
        setError(t('errors.maxStock', { count: maxAvailable }));
        window.setTimeout(() => setError(null), CART_CONFIG.ERROR_TIMEOUT);
      }
      return;
    }
    await updateItemQuantity(item.id, nextQuantity);
  };

  const handleQuantityInput = async (item: CartItem, value: string, t: (key: string, values?: Record<string, string | number | Date>) => string) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return;
    }
    const maxAvailable = parseStock(item.attrs?.stock) ?? CART_CONFIG.MAX_STOCK_DEFAULT;
    const clamped = Math.max(1, Math.min(maxAvailable, parsed));
    if (clamped === item.quantity) {
      if (parsed > maxAvailable) {
        setError(t('errors.maxStock', { count: maxAvailable }));
        window.setTimeout(() => setError(null), CART_CONFIG.ERROR_TIMEOUT);
      }
      return;
    }
    await updateItemQuantity(item.id, clamped);
  };

  return { handleQuantityChange, handleQuantityInput };
};