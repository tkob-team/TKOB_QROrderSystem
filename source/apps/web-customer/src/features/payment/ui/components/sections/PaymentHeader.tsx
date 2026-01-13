import { ArrowLeft } from 'lucide-react'

interface PaymentHeaderProps {
  onBack: () => void
}

export function PaymentHeader({ onBack }: PaymentHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
        </button>
        <h2 style={{ color: 'var(--gray-900)' }}>Payment</h2>
      </div>
    </div>
  )
}
