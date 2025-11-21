'use client';

export function MenuManagementPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your menu items, categories, and pricing
          </p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
          + Add Menu Item
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <a
            href="#"
            className="border-primary-600 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            All Items
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Categories
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Modifiers
          </a>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No menu items yet
          </h3>
          <p className="text-gray-600 mb-6">
            Menu management features will be implemented in <code className="bg-gray-100 px-2 py-1 rounded">src/features/menu-management</code>
          </p>
          <p className="text-sm text-gray-500">
            Click "Add Menu Item" to create your first menu item
          </p>
        </div>
      </div>
    </div>
  );
}
