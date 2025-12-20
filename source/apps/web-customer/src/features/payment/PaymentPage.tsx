'use client'

import { useRouter } from 'next/navigation'

export function PaymentPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--gray-50)' }}>
      <h1 className="text-2xl mb-4">Payment</h1>
      <p>TODO: Migrate from CardPayment.tsx</p>
      <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-gray-200 rounded">Back</button>
    </div>
  )
}
