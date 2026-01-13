import { mockTable } from '@/lib/mockData'

interface SummarySectionProps {
  total: number
  itemCount: number
}

export function SummarySection({ total, itemCount }: SummarySectionProps) {
  return (
    <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          Table {mockTable.number} · {itemCount} items
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span style={{ color: 'var(--gray-900)' }}>
          ${total.toFixed(2)}
        </span>
        <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>total</span>
      </div>
    </div>
  )
}
