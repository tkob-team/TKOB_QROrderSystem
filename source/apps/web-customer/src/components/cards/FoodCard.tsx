import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { OptimizedImage } from '@packages/ui';

interface FoodCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function FoodCard({ item, onAdd }: FoodCardProps) {
  const availability = item.availability || 'Available';
  const isAvailable = availability === 'Available';
  const isSoldOut = availability === 'Sold out';
  const isUnavailable = availability === 'Unavailable';

  // Badge styling
  const getBadgeStyles = () => {
    if (item.badge === 'Popular') {
      return {
        backgroundColor: 'rgba(245, 158, 11, 0.95)', // Amber with slight transparency
        color: 'white',
      };
    }
    if (item.badge === 'Chef\'s recommendation') {
      return {
        backgroundColor: 'rgba(16, 185, 129, 0.95)', // Emerald with slight transparency
        color: 'white',
      };
    }
    return {};
  };

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden transition-all max-w-2xl mx-auto ${isAvailable ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed'}`}
      style={{ 
        borderWidth: '1px', 
        borderColor: 'var(--gray-200)',
        opacity: isUnavailable ? 0.6 : 1,
      }} 
      onClick={() => isAvailable && onAdd(item)}
    >
      <div className="flex md:flex-row gap-4 p-4">
        {/* Image */}
        <div className="flex-shrink-0 relative w-24 md:w-40">
          <OptimizedImage
            src={item.imageUrl}
            alt={item.name}
            width={160}
            height={160}
            className="w-full h-24 md:h-40 object-cover rounded-lg"
            style={{
              opacity: isSoldOut ? 0.5 : 1,
              filter: isSoldOut ? 'grayscale(30%)' : 'none',
            }}
          />
          
          {/* Badge - Top Left */}
          {item.badge && !isUnavailable && (
            <div 
              className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md"
              style={{
                ...getBadgeStyles(),
                fontSize: '10px',
                fontWeight: '600',
                backdropFilter: 'blur(4px)',
              }}
            >
              {item.badge}
            </div>
          )}

          {/* Sold Out Badge - Top Right */}
          {isSoldOut && (
            <div 
              className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--gray-900)',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
              }}
            >
              Sold out
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 
              className="text-base md:text-lg font-medium" 
              style={{ 
                color: isUnavailable ? 'var(--gray-500)' : 'var(--gray-900)',
              }}
            >
              {item.name}
            </h3>
          </div>
          
          <p 
            className="line-clamp-2 text-sm mb-2" 
            style={{ 
              color: isUnavailable ? 'var(--gray-400)' : 'var(--gray-600)', 
            }}
          >
            {isUnavailable ? 'Unavailable' : item.description}
          </p>

          {/* Dietary badges */}
          {item.dietary && item.dietary.length > 0 && !isUnavailable && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.dietary.map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: 'var(--emerald-50)',
                    color: 'var(--emerald-600)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Price and Add button */}
          <div className="flex items-center justify-between mt-auto">
            <span 
              className="text-base md:text-lg font-semibold"
              style={{ 
                color: isUnavailable ? 'var(--gray-400)' : 'var(--gray-900)',
              }} 
            >
              ${item.basePrice.toFixed(2)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) {
                  onAdd(item);
                }
              }}
              disabled={!isAvailable}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isAvailable ? 'hover:shadow-md active:scale-95' : 'cursor-not-allowed'}`}
              style={{
                backgroundColor: isAvailable ? 'var(--orange-500)' : 'var(--gray-300)',
                color: 'white',
                opacity: isAvailable ? 1 : 0.5,
              }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}