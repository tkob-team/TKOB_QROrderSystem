'use client';

import Link from 'next/link';

interface OrderTrackingPageProps {
  orderId: string;
}

export function OrderTrackingPage({ orderId }: OrderTrackingPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Track Order</h1>
          <p className="text-sm text-gray-500">Order #{orderId}</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Order Confirmed
            </h2>
            <p className="text-gray-600">
              Your order has been received and is being prepared
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <p className="text-sm text-gray-500 text-center">
              Order tracking timeline will be implemented in <code className="bg-gray-100 px-2 py-1 rounded">src/features/order-tracking</code>
            </p>

            {/* Timeline Steps (placeholder) */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="relative flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Order Placed</h3>
                  <p className="text-sm text-gray-500">Just now</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-600">Preparing</h3>
                  <p className="text-sm text-gray-500">Waiting...</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-600">Ready</h3>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-600">Served</h3>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="text-gray-800 font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Table</span>
              <span className="text-gray-800 font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="text-gray-800 font-medium">-</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/menu"
            className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition-colors"
          >
            Order More Items
          </Link>
          <Link
            href="/"
            className="block w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
