// Cart API types - matching backend DTOs

export interface CartModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItemResponse {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
  itemTotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  subtotal: number;
  tax: number;
  taxRate: number;
  serviceCharge: number;
  serviceChargeRate: number;
  total: number;
  itemCount: number;
}

// Request types
export interface AddToCartModifier {
  groupId: string;
  optionId: string;
}

export interface AddToCartRequest {
  menuItemId: string;
  quantity: number;
  modifiers?: AddToCartModifier[];
  notes?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
  notes?: string;
}
