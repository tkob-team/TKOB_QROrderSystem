import type { MenuItem } from '@/types'

interface ItemInfoSectionProps {
  item: MenuItem
}

export function ItemInfoSection({ item }: ItemInfoSectionProps) {
  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex items-start justify-between mb-2">
        <h1 style={{ color: 'var(--gray-900)' }}>{item.name}</h1>
        <span style={{ color: 'var(--gray-900)' }}>
          ${item.basePrice.toFixed(2)}
        </span>
      </div>
      <p className="mb-3" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
        {item.description}
      </p>
      {item.dietary && item.dietary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.dietary.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                fontSize: '13px',
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
