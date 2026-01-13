import { MenuItem } from '@/types'
import { OptimizedImage } from '@packages/ui'
import { Plus } from 'lucide-react'

interface PeopleUsuallyAddProps {
  item: MenuItem
  allMenuItems: MenuItem[]
  onAddToCart: (item: MenuItem) => void
}

export function PeopleUsuallyAdd({
  item,
  allMenuItems,
  onAddToCart,
}: PeopleUsuallyAddProps) {
  // Get recommended items based on category
  const getRecommendedItems = (): MenuItem[] => {
    const category = item.category
    let recommendedCategories: string[] = []

    if (category === 'Starters') {
      recommendedCategories = ['Mains', 'Drinks']
    } else if (category === 'Mains') {
      recommendedCategories = ['Starters', 'Drinks']
    } else if (category === 'Desserts') {
      recommendedCategories = ['Drinks']
    } else if (category === 'Drinks') {
      recommendedCategories = ['Starters', 'Desserts']
    }

    // Filter items by recommended categories, excluding current item
    const recommendations = allMenuItems
      .filter(
        (menuItem) =>
          recommendedCategories.includes(menuItem.category) &&
          menuItem.id !== item.id
      )
      .slice(0, 3) // Limit to 3 items

    return recommendations
  }

  const recommendedItems = getRecommendedItems()

  // Don't render if no recommendations
  if (recommendedItems.length === 0) {
    return null
  }

  return (
    <div>
      {/* Section Title */}
      <div className="p-4 pb-0">
        <h3 style={{ color: 'var(--gray-900)' }}>People usually add</h3>
        <p
          className="mt-1"
          style={{ color: 'var(--gray-500)', fontSize: '13px' }}
        >
          Recommended with this item
        </p>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="px-4 py-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-3">
          {recommendedItems.map((recommendedItem) => (
            <div
              key={recommendedItem.id}
              className="flex-shrink-0 w-[140px] rounded-xl border bg-white overflow-hidden"
              style={{ borderColor: 'var(--gray-200)' }}
            >
              {/* Item Image */}
              <div className="relative aspect-square w-full">
                <OptimizedImage
                  src={recommendedItem.imageUrl}
                  alt={recommendedItem.name}
                  width={140}
                  height={140}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Item Info */}
              <div className="p-3">
                <p
                  className="line-clamp-2 mb-1"
                  style={{
                    color: 'var(--gray-900)',
                    fontSize: '14px',
                    lineHeight: '1.3',
                    minHeight: '2.6em',
                  }}
                >
                  {recommendedItem.name}
                </p>
                <p
                  className="mb-2"
                  style={{ color: 'var(--gray-900)', fontSize: '14px' }}
                >
                  ${recommendedItem.basePrice.toFixed(2)}
                </p>

                {/* Add Button */}
                <button
                  onClick={() => onAddToCart(recommendedItem)}
                  className="w-full py-2 px-3 rounded-full flex items-center justify-center gap-1 transition-all active:scale-95"
                  style={{
                    backgroundColor: 'var(--orange-500)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar on webkit browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
