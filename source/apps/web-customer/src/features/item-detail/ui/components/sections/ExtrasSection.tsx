import type { MenuItemTopping } from '@/types/menu'

interface ExtrasSectionProps {
  toppings: MenuItemTopping[]
  selectedToppings: string[]
  onToggle: (id: string) => void
}

export function ExtrasSection({ toppings, selectedToppings, onToggle }: ExtrasSectionProps) {
  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
      <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
        Add extras
      </h3>
      <div className="space-y-2">
        {toppings.map((topping) => (
          <button
            key={topping.id}
            onClick={() => onToggle(topping.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              selectedToppings.includes(topping.id)
                ? 'border-(--orange-500) bg-(--orange-50)'
                : 'border-(--gray-200) hover:border-(--gray-300)'
            }`}
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedToppings.includes(topping.id)
                  ? 'border-(--orange-500) bg-(--orange-500)'
                  : 'border-(--gray-300)'
              }`}>
                {selectedToppings.includes(topping.id) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                {topping.name}
              </span>
            </div>
            <span style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
              +${topping.price.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
