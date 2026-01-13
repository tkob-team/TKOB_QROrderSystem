import type { Order } from '@/types'

interface OrderContextSectionProps {
  existingOrder: Order
}

export function OrderContextSection({ existingOrder }: OrderContextSectionProps) {
  return (
    <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--orange-300)', backgroundColor: 'var(--orange-50)' }}>
      <div className="mb-2" style={{ color: 'var(--orange-900)', fontSize: '15px' }}>
        Order #{existingOrder.id}
      </div>
      <div style={{ color: 'var(--orange-700)', fontSize: '13px' }}>
        Table {existingOrder.tableNumber}
      </div>
      <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--orange-200)' }}>
        <span style={{ color: 'var(--orange-900)', fontSize: '14px' }}>Total</span>
        <span style={{ color: 'var(--orange-900)' }}>${existingOrder.total.toFixed(2)}</span>
      </div>
    </div>
  )
}
