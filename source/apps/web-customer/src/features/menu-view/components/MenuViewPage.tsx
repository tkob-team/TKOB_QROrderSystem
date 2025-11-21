'use client';

import Link from 'next/link';

export function MenuViewPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
          <p className="text-sm text-gray-500">Choose your items</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            Menu items will be loaded from <code className="bg-gray-100 px-2 py-1 rounded">src/features/menu-view</code>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Connect this page to your menu-view feature components
          </p>
        </div>
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6">
        <Link href="/cart">
          <button className="bg-primary-600 text-white rounded-full px-6 py-3 shadow-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-semibold">Cart (0)</span>
          </button>
        </Link>
      </div>
    </main>
  );
}
