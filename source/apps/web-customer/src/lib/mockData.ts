// Mock data for development and testing
// This file re-exports mock data from the API mocks directory for component usage

import { mockTable } from '@/api/mocks/data/tables.data'
import { mockRestaurant } from '@/api/mocks/data/restaurant.data'
import { mockMenuItems } from '@/api/mocks/data/menu.data'

// Re-export for backward compatibility
export { mockTable, mockRestaurant, mockMenuItems }

// Categories (if needed by components)
export const categories = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
]

// Re-export Order type from types
export type { Order } from '@/types/order'
