import type { MenuItem } from '@/types'
import { OptimizedImage } from '@packages/ui'

interface RelatedItemsSectionProps {
  items: MenuItem[]
  onOpenItem: (id: string) => void
}

export function RelatedItemsSection({ items, onOpenItem }: RelatedItemsSectionProps) {
  if (items.length === 0) return null

  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
      <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
        You might also like
      </h3>
      <div className="overflow-x-auto -mx-4 px-4 hide-scrollbar">
        <div className="flex gap-3">
          {items.map((relatedItem) => (
            <button
              key={relatedItem.id}
              onClick={() => onOpenItem(relatedItem.id)}
              className="shrink-0 w-36 bg-white rounded-xl overflow-hidden border transition-all hover:shadow-md active:scale-98"
              style={{ borderColor: 'var(--gray-200)' }}
            >
              <OptimizedImage
                src={relatedItem.imageUrl}
                alt={relatedItem.name}
                className="w-full h-24 object-cover"
              />
              <div className="p-3">
                <h4
                  className="line-clamp-2 mb-1"
                  style={{ color: 'var(--gray-900)', fontSize: '14px', minHeight: '36px' }}
                >
                  {relatedItem.name}
                </h4>
                <span style={{ color: 'var(--orange-500)', fontSize: '14px' }}>
                  ${relatedItem.basePrice.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
