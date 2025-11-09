export interface CartItemAttributes {
  [key: string]: unknown;
}

export interface CartItem {
  id: string;
  productId: string;
  shopId?: string;
  quantity: number;
  unit?: string;
  price?: number;
  title?: string;
  thumbnail?: string;
  attrs?: CartItemAttributes;
  addedAt?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartTotals {
  totalQuantity: number;
  subtotal: number;
}
