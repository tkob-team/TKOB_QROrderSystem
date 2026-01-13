import { PaymentPageContent } from './PaymentPageContent'

/**
 * Payment page wrapper component.
 * Re-exports PaymentPageContent for backward compatibility.
 * 
 * Note: The actual component logic is in PaymentPageContent.tsx
 * which uses useSearchParams() and must be wrapped in Suspense
 * by the page route.
 */
export function PaymentPage() {
  return <PaymentPageContent />
}
