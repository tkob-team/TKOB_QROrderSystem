import { XCircle } from 'lucide-react'

interface CartConfirmModalProps {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function CartConfirmModal({
  open,
  title = 'Remove item',
  message = 'Are you sure you want to remove this item from your cart?',
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: CartConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
        onClick={onCancel}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl shadow-xl"
        style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)' }}
      >
        <div className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--red-50)' }}
            >
              <XCircle className="w-6 h-6" style={{ color: 'var(--red-500)' }} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--gray-900)' }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
              {message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 rounded-xl border transition-colors"
              style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-800)' }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-3 rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--red-500)', color: 'white' }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
