'use client';

import Link from 'next/link';

export function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/cart"
            className="text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
            <p className="text-sm text-gray-500">Complete your order</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Information
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Customer info form will be implemented in <code className="bg-gray-100 px-2 py-1 rounded">src/features/checkout</code>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Your phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                placeholder="Any special requests?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Method
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Payment options will be implemented in <code className="bg-gray-100 px-2 py-1 rounded">src/features/checkout</code>
          </p>
          
          <div className="space-y-3">
            <div className="border border-gray-300 rounded-lg p-4 opacity-50">
              <div className="flex items-center gap-3">
                <input type="radio" disabled />
                <span className="font-medium">Pay at Counter</span>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 opacity-50">
              <div className="flex items-center gap-3">
                <input type="radio" disabled />
                <span className="font-medium">Credit/Debit Card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800 font-medium">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-800 font-medium">$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary-600">$0.00</span>
            </div>
          </div>
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            Place Order
          </button>
        </div>
      </div>
    </main>
  );
}
