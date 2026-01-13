// Application constants

// API Mode
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Tax and charges
export const TAX_RATE = 0.1; // 10%
export const SERVICE_CHARGE_RATE = 0.05; // 5%

// Pagination
export const ITEMS_PER_PAGE = 6;

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  COUNTER: 'counter',
} as const;

// Order status progression
export const ORDER_STATUS_FLOW = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'Served',
  'Completed',
] as const;
