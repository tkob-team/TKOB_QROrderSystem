import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { OptimizedImage } from '@packages/ui';
import { ChefRecommendationIndicator } from '@/shared/components/indicators/ChefRecommendationIndicator';
import { formatUSD } from '@/shared/utils/currency';
import { colors, shadows, transitions } from '@/styles/design-tokens';

interface FoodCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function FoodCard({ item, onAdd }: FoodCardProps) {
  const availability = item.availability || 'Available';
  const isAvailable = availability === 'Available';
  const isSoldOut = availability === 'Sold out';
  const isUnavailable = availability === 'Unavailable';
  const isChefRecommended = item.chefRecommended === true;

  // Badge styling for "Popular" only
  const getBadgeStyles = () => {
    if (item.badge === 'Popular') {
      return {
        backgroundColor: colors.accent[600],
        color: 'white',
        boxShadow: shadows.sm,
      };
    }
    return {};
  };

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden max-w-2xl mx-auto ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      style={{ 
        borderWidth: '1px', 
        borderColor: colors.border.light,
        opacity: isUnavailable ? 0.6 : 1,
        boxShadow: shadows.card,
        transition: transitions.default,
        ...(isAvailable && {
          ':hover': {
            boxShadow: shadows.cardHover,
            transform: 'translateY(-2px)',
          }
        })
      }} 
      onClick={() => isAvailable && onAdd(item)}
      onMouseEnter={(e) => {
        if (isAvailable) {
          e.currentTarget.style.boxShadow = shadows.cardHover;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadows.card;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex md:flex-row gap-4 p-4">
        {/* Image */}
        <div className="flex-shrink-0 relative w-28 md:w-40">
          <OptimizedImage
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-28 md:h-40 object-cover rounded-lg"
            style={{
              opacity: isSoldOut ? 0.5 : 1,
              filter: isSoldOut ? 'grayscale(30%)' : 'none',
            }}
          />
          
          {/* Chef Recommendation Icon - Top Left */}
          {isChefRecommended && !isUnavailable && (
            <div className="absolute top-2 left-2 z-10">
              <ChefRecommendationIndicator enabled={true} />
            </div>
          )}

          {/* Popular Badge - Top Left (adjusted if no chef icon) */}
          {item.badge === 'Popular' && !isUnavailable && (
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
                backgroundColor: colors.neutral[900],
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                boxShadow: shadows.sm,
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
                color: isUnavailable ? colors.text.muted : colors.text.primary,
                fontFamily: "'Playfair Display SC', serif",
                fontWeight: 600,
              }}
            >
              {item.name}
            </h3>
          </div>
          
          <p 
            className="line-clamp-2 text-sm mb-2" 
            style={{ 
              color: isUnavailable ? colors.text.light : colors.text.muted,
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
                    backgroundColor: colors.success.light,
                    color: colors.success.dark,
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
                color: isUnavailable ? colors.text.light : colors.primary[600],
                fontFamily: "'Playfair Display SC', serif",
              }} 
            >
              {formatUSD(item.basePrice)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) {
                  onAdd(item);
                }
              }}
              disabled={!isAvailable}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${isAvailable ? 'active:scale-95' : 'cursor-not-allowed'}`}
              style={{
                backgroundColor: isAvailable ? colors.primary[600] : colors.neutral[300],
                color: 'white',
                opacity: isAvailable ? 1 : 0.5,
                boxShadow: isAvailable ? shadows.button : 'none',
                transition: transitions.fast,
              }}
              onMouseEnter={(e) => {
                if (isAvailable) {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                  e.currentTarget.style.boxShadow = shadows.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                if (isAvailable) {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                  e.currentTarget.style.boxShadow = shadows.button;
                }
              }}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}