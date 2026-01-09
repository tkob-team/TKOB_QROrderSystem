import type { MenuItemSize } from '@/types/menu'

interface SizeSelectorSectionProps {
  sizes: MenuItemSize[]
  selectedSize: string
  onSelectSize: (size: string) => void
}

export function SizeSelectorSection({ sizes, selectedSize, onSelectSize }: SizeSelectorSectionProps) {
  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
      <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
        Choose size
      </h3>
      <div className="space-y-2">
        {sizes.map((size) => (
          <button
            key={size.size}
            onClick={() => onSelectSize(size.size)}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              selectedSize === size.size
                ? 'border-(--orange-500) bg-(--orange-50)'
                : 'border-(--gray-200) hover:border-(--gray-300)'
            }`}
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedSize === size.size
                  ? 'border-(--orange-500)'
                  : 'border-(--gray-300)'
              }`}>
                {selectedSize === size.size && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--orange-500)' }} />
                )}
              </div>
              <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                {size.size}
              </span>
            </div>
            <span style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
              ${size.price.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
