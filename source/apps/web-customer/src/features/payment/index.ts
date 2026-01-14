// Feature barrel export - expose pages and controller hook
export { CardPaymentPage, PaymentPage } from './ui/pages'
export { usePaymentController } from './hooks'
export type { PaymentStatus, PaymentState, PaymentActions, PaymentController } from './model'

// Feature data layer
export { PaymentDataFactory } from './data'
export type { IPaymentStrategy } from './data'
