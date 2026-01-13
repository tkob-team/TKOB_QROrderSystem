import { Minus, Plus } from 'lucide-react'

interface StickyActionBarProps {
  quantity: number
  onDecrement: () => void
  onIncrement: () => void
  onAddToCart: () => void
  total: number
}

export function StickyActionBar({ quantity, onDecrement, onIncrement, onAddToCart, total }: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="max-w-120 mx-auto flex items-center gap-3">
        <div className="flex items-center gap-3 border rounded-full px-2 py-1" style={{ borderColor: 'var(--gray-300)' }}>
          <button
            onClick={onDecrement}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-(--gray-100)"
            disabled={quantity <= 1}
          >
            <Minus className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
          </button>
          <span className="min-w-6 text-center" style={{ color: 'var(--gray-900)' }}>
            {quantity}
          </span>
          <button
            onClick={onIncrement}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-(--gray-100)"
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
          </button>
        </div>

        <button
          onClick={onAddToCart}
          className="flex-1 py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
            minHeight: '48px',
          }}
        >
          <span>Add to cart</span>
          <span>${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  )
}
