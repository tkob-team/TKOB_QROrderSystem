import { ShoppingCart } from 'lucide-react';

interface CartConfirmModalProps {
  itemCount: number;
  onKeep: () => void;
  onClear: () => void;
}

export function CartConfirmModal({ itemCount, onKeep, onClear }: CartConfirmModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onKeep}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div 
          className="bg-white rounded-t-3xl p-6 shadow-xl"
          style={{ maxWidth: '480px', margin: '0 auto' }}
        >
          {/* Icon */}
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--orange-100)' }}
          >
            <ShoppingCart className="w-7 h-7" style={{ color: 'var(--orange-500)' }} />
          </div>

          {/* Title */}
          <h3 className="text-center mb-2" style={{ color: 'var(--gray-900)' }}>
            Keep your current cart?
          </h3>

          {/* Description */}
          <p className="text-center mb-6" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart. Would you like to keep or clear your cart?
          </p>

          {/* Actions */}
          <div className="space-y-2">
            {/* Keep Button (Primary) */}
            <button
              onClick={onKeep}
              className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
              style={{
                backgroundColor: 'var(--orange-500)',
                color: 'white',
                minHeight: '48px',
              }}
            >
              Keep cart
            </button>

            {/* Clear Button (Secondary) */}
            <button
              onClick={onClear}
              className="w-full py-3 px-4 rounded-full transition-all hover:bg-[var(--gray-100)] active:scale-98"
              style={{
                backgroundColor: 'white',
                color: 'var(--gray-700)',
                borderWidth: '2px',
                borderColor: 'var(--gray-300)',
                minHeight: '48px',
              }}
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
