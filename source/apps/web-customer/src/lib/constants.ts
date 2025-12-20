// Application constants

// API Mode: true = use mock data, false = use real API
// Accepts: 'true', 'false', 'mock', 'real' (backward compatible)
const apiModeValue = process.env.NEXT_PUBLIC_API_MODE || 'false';
export const USE_MOCK_API = 
  apiModeValue === 'true' || 
  apiModeValue === 'mock' || 
  apiModeValue === '1';
export const API_MODE = USE_MOCK_API ? 'mock' : 'real';

// Debug log
if (typeof window !== 'undefined') {
  console.log('[Constants] ENV:', process.env.NEXT_PUBLIC_API_MODE);
  console.log('[Constants] USE_MOCK_API:', USE_MOCK_API);
  console.log('[Constants] API_MODE:', API_MODE);
}

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

// QR token
export const MOCK_QR_TOKEN = 'mock-token-123';
