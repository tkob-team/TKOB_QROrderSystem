// Feature barrel export - only expose pages and controller hook

// Pages
export { OrderListPage, OrderDetailPage, OrderConfirmationPage } from './ui/pages'

// Public API (controller only - queries remain internal)
export { useOrdersController } from './hooks'

// Types for external consumption
export type { Order, OrderItem, OrderStatus, PaymentStatus, OrdersState } from './model'
