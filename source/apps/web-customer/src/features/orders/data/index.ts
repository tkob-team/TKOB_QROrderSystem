/**
 * Orders feature data layer
 */

export { OrdersDataFactory } from './factory';
export type { IOrdersAdapter } from './adapter.interface';
// Backward compatibility
export type { IOrdersStrategy } from './types';

// Order tracking
export * from './tracking'
