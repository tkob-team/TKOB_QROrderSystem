import { MailCheck, X } from 'lucide-react'

interface VerifyEmailRequiredModalProps {
  open: boolean
  onClose: () => void
  onVerifyEmail: () => void
}

export function VerifyEmailRequiredModal({ open, onClose, onVerifyEmail }: VerifyEmailRequiredModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)' }}
      >
        <div className="flex justify-end p-4">
          <button type="button" aria-label="Close" onClick={onClose} className="p-2 rounded-full">
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--orange-50)' }}>
            <MailCheck className="w-8 h-8" style={{ color: 'var(--orange-500)' }} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--gray-900)' }}>
              Verify your email
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
              We need a verified email to share order receipts and review updates. Please verify to continue.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-800)' }}
            >
              Not now
            </button>
            <button
              type="button"
              onClick={onVerifyEmail}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
            >
              Verify email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
