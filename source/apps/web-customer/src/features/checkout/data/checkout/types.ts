// Checkout API types - matching backend DTOs

/**
 * Checkout request
 * Creates order from current cart
 */
export interface CheckoutRequest {
  customerName?: string;
  customerNotes?: string;
  paymentMethod: 'BILL_TO_TABLE' | 'SEPAY_QR';
  tipPercent?: number; // 0, 0.05, 0.10, 0.15
}

/**
 * Order response from checkout
 */
export interface CheckoutResponse {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  tip: number;
  serviceCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  items: CheckoutOrderItem[];
  createdAt: string;
}

export interface CheckoutOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: Array<{
    groupName: string;
    optionName: string;
    priceDelta: number;
  }>;
  notes?: string;
  itemTotal: number;
}

/**
 * Payment intent request
 * Creates SePay QR payment
 */
export interface PaymentIntentRequest {
  orderId: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Payment intent response
 * Contains QR code data for VietQR
 */
export interface PaymentIntentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  amountVND: number; // Amount in VND for SePay
  currency: string;
  qrContent: string; // VietQR content for QR code generation
  qrCodeUrl: string; // URL to SePay QR image
  deepLink?: string; // Deep link to banking app
  transferContent: string; // Transfer description
  accountNumber: string;
  bankCode: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Payment status response
 */
export interface PaymentStatusResponse {
  paymentId: string;
  orderId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  amount: number;
  paidAt?: string;
  failureReason?: string;
}
