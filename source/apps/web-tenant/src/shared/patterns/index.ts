/**
 * Shared Patterns - Reusable UI Patterns
 * 
 * High-level components that compose multiple primitives.
 * Used across multiple features for consistency.
 */

export { PageHeader } from './PageHeader';
export { FilterBar } from './FilterBar';
export {
  StatusPill,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  TABLE_STATUS_CONFIG,
  type StatusTone,
  type OrderStatus,
  type PaymentStatus,
  type TableStatus,
} from './StatusPill';
export { EmptyState, ErrorState } from './EmptyState';
export {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
} from './Skeleton';
export { DetailDrawer } from './DetailDrawer';
