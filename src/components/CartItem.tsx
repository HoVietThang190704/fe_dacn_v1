import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CartItem as CartItemEntity } from '@/domain/entities/Cart';
import { useFormatCurrency } from '@/lib/utils';
import { useCartItemQuantity } from '@/hooks/useCartItemQuantity';
import { CART_CONFIG } from '@/lib/config';

interface CartItemProps {
  item: CartItemEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  isItemUpdating: boolean;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export function CartItem({ item, isSelected, onSelect, onRemove, isItemUpdating, updateItemQuantity, setError }: CartItemProps) {
  const t = useTranslations('cart');
  const formatCurrency = useFormatCurrency();
  const { handleQuantityChange, handleQuantityInput } = useCartItemQuantity({ updateItemQuantity, setError });
  const lineTotal = (item.price ?? 0) * (item.quantity || 0);
  const maxAvailable = typeof item.attrs?.stock === 'number' ? (item.attrs.stock as number) : CART_CONFIG.MAX_STOCK_DEFAULT;

  return (
    <li className="p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-6">
        <div className="lg:col-span-5 flex items-start gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.id)}
            className="mt-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={item.thumbnail || '/icons/shopping-cart.svg'}
                alt={item.title || 'Product'}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">{item.title || t('unknownProduct')}</p>
              <p className="text-xs text-gray-500">{t('sku', { id: item.productId })}</p>
              {item.unit && <p className="text-xs text-gray-400">{t('unitLabel', { unit: item.unit })}</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 text-sm font-semibold text-gray-900 text-left lg:text-center">
          {formatCurrency(item.price ?? 0)}
        </div>

        <div className="lg:col-span-2">
          <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => handleQuantityChange(item, -1, t)}
              disabled={item.quantity <= 1 || isItemUpdating}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              aria-label={t('decreaseQuantity')}
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={maxAvailable}
              value={item.quantity}
              onChange={(event) => handleQuantityInput(item, event.target.value, t)}
              className="w-12 text-center text-sm font-semibold text-gray-800 focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(item, 1, t)}
              disabled={isItemUpdating || (item.quantity >= maxAvailable)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              aria-label={t('increaseQuantity')}
            >
              +
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 text-sm font-semibold text-orange-500 text-left lg:text-center">
          {formatCurrency(lineTotal)}
        </div>

        <div className="lg:col-span-1 text-right lg:text-center">
          <button
            onClick={() => onRemove(item.id)}
            disabled={isItemUpdating}
            className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-40"
          >
            {t('remove')}
          </button>
        </div>
      </div>
    </li>
  );
}