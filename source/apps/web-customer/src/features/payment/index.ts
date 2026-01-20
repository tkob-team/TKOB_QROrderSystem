// Feature barrel export - expose pages and controller hook
export { PaymentPage } from './ui/pages'
export { useSepayPaymentController, usePaymentPolling } from './hooks'
export type { PaymentStatus, PaymentState, PaymentActions, PaymentController } from './model'

// Feature data layer
export { PaymentDataFactory } from './data'
export type { IPaymentStrategy } from './data'
