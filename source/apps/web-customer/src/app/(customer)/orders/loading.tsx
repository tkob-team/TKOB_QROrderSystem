/**
 * Orders Page Loading State
 * 
 * Displays skeleton loader while order history is being fetched
 */

import { OrdersSkeleton } from '@/shared/components/skeletons'

export default function OrdersLoading() {
  return <OrdersSkeleton />
}
