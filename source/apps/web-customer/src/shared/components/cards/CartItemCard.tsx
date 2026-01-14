import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { OptimizedImage } from '@packages/ui';

interface CartItemCardProps {
  cartItem: CartItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  onEdit: (cartItem: CartItem) => void;
}

export function CartItemCard({ cartItem, onUpdateQuantity, onRemove, onEdit }: CartItemCardProps) {
  const getItemTotal = () => {
    let total = cartItem.menuItem.basePrice;

    // Add size price
    if (cartItem.selectedSize && cartItem.menuItem.sizes) {
      const size = cartItem.menuItem.sizes.find((s) => s.size === cartItem.selectedSize);
      if (size) {
        total = size.price;
      }
    }

    // Add topping prices
    if (cartItem.menuItem.toppings) {
      cartItem.selectedToppings.forEach((toppingId) => {
        const topping = cartItem.menuItem.toppings!.find((t) => t.id === toppingId);
        if (topping) {
          total += topping.price;
        }
      });
    }

    return total * cartItem.quantity;
  };

  return (
    <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex gap-3">
        {/* Image */}
        <OptimizedImage
          src={cartItem.menuItem.imageUrl}
          alt={cartItem.menuItem.name}
          width={80}
          height={80}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="truncate" style={{ color: 'var(--gray-900)' }}>
              {cartItem.menuItem.name}
            </h4>
            <button
              onClick={() => onRemove(cartItem.id)}
              className="ml-2 p-1 rounded-lg transition-colors hover:bg-[var(--gray-100)]"
            >
              <Trash2 className="w-4 h-4" style={{ color: 'var(--red-500)' }} />
            </button>
          </div>

          {/* Modifiers */}
          {(cartItem.selectedSize || cartItem.selectedToppings.length > 0) && (
            <div className="mb-2" style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
              {cartItem.selectedSize && <div>Size: {cartItem.selectedSize}</div>}
              {cartItem.selectedToppings.length > 0 && (
                <div>
                  Extras:{' '}
                  {cartItem.selectedToppings
                    .map((id) => {
                      const topping = cartItem.menuItem.toppings?.find((t) => t.id === id);
                      return topping?.name;
                    })
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Special Instructions */}
          {cartItem.specialInstructions && (
            <div className="mb-2 px-2 py-1 rounded" style={{ backgroundColor: 'var(--orange-50)', fontSize: '12px', color: 'var(--gray-700)' }}>
              Note: {cartItem.specialInstructions}
            </div>
          )}

          {/* Quantity and Price */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 border rounded-full px-1 py-0.5" style={{ borderColor: 'var(--gray-300)' }}>
              <button
                onClick={() => onUpdateQuantity(cartItem.id, Math.max(1, cartItem.quantity - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
                disabled={cartItem.quantity <= 1}
              >
                <Minus className="w-3 h-3" style={{ color: 'var(--gray-700)' }} />
              </button>
              <span className="min-w-[20px] text-center" style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                {cartItem.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
              >
                <Plus className="w-3 h-3" style={{ color: 'var(--gray-700)' }} />
              </button>
            </div>

            <span style={{ color: 'var(--gray-900)' }}>
              ${getItemTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
