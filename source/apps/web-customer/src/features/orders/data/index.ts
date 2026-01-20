/**
 * Orders feature data layer
 */

export { OrdersDataFactory } from './factory';
export type { IOrdersAdapter } from './adapter.interface';
// Backward compatibility
export type { IOrdersStrategy } from './types';

// Order tracking
export * from './tracking'

// Direct API access for hooks
export { orderApi } from './api/orders.adapter';
export type { 
  SessionBillPreview, 
  RequestBillResponse, 
  CancelBillResponse 
} from './api/orders.adapter';
