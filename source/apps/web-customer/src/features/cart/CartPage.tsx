'use client'

import { ArrowLeft, ShoppingBag, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CartItemCard } from '@/components/cards/CartItemCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

export function CartPage() {
  const router = useRouter();
  const { items: cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, cartItem) => {
      let itemPrice = cartItem.menuItem.basePrice;

      if (cartItem.selectedSize && cartItem.menuItem.sizes) {
        const size = cartItem.menuItem.sizes.find((s) => s.size === cartItem.selectedSize);
        if (size) itemPrice = size.price;
      }

      if (cartItem.menuItem.toppings) {
        cartItem.selectedToppings.forEach((toppingId) => {
          const topping = cartItem.menuItem.toppings!.find((t) => t.id === toppingId);
          if (topping) itemPrice += topping.price;
        });
      }

      return sum + itemPrice * cartItem.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1; // 10% tax
  const serviceCharge = subtotal * 0.05; // 5% service charge
  const total = subtotal + tax + serviceCharge;

  const handleBack = () => {
    router.back();
  };

  const handleEditItem = (item: any) => {
    // TODO: Navigate to item detail with edit mode
    router.push(`/menu/${item.menuItem.id}`);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <div className="flex-1">
            <h2 style={{ color: 'var(--gray-900)' }}>Your order</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      {cartItems.length === 0 ? (
        <div className="flex-1">
          <EmptyState
            icon={<ShoppingBag className="w-16 h-16" />}
            title="Your cart is empty"
            message="Add items from the menu to get started"
            actionLabel="Browse menu"
            onAction={handleBack}
          />
        </div>
      ) : (
        <>
          {/* Cart Items - Single Column */}
          <div className="flex-1 p-4 pb-24">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  cartItem={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onEdit={handleEditItem}
                />
              ))}
            </div>

            {/* Order Summary - Collapsible Accordion */}
            <div className="mt-4 bg-white rounded-xl border" style={{ borderColor: 'var(--gray-200)' }}>
              <button
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="w-full p-4 flex items-center justify-between"
              >
                <h3 style={{ color: 'var(--gray-900)' }}>Order summary</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${summaryExpanded ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--gray-600)' }}
                />
              </button>
              
              {summaryExpanded && (
                <div className="px-4 pb-4 space-y-2" style={{ fontSize: '14px' }}>
                  <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                    <span>Service charge (5%)</span>
                    <span>${serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <div className="mt-4">
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                }}
              >
                Go to checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}