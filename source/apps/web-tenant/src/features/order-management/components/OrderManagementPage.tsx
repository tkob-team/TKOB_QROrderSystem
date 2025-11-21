'use client';

export function OrderManagementPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage all restaurant orders
          </p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Orders</option>
            <option>Pending</option>
            <option>Preparing</option>
            <option>Ready</option>
            <option>Completed</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
            Kitchen Display
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <a
            href="#"
            className="border-primary-600 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            All Orders
            <span className="ml-2 bg-primary-100 text-primary-600 py-0.5 px-2.5 rounded-full text-xs font-semibold">
              24
            </span>
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Pending
            <span className="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2.5 rounded-full text-xs font-semibold">
              5
            </span>
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Preparing
            <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-semibold">
              8
            </span>
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Ready
            <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2.5 rounded-full text-xs font-semibold">
              3
            </span>
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Completed
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-semibold">
              8
            </span>
          </a>
        </nav>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Orders</h2>
            <div className="text-sm text-gray-500">
              Updated <span className="font-medium">just now</span>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Order Management
          </h3>
          <p className="text-gray-600 mb-4">
            Order management features will be implemented in <code className="bg-gray-100 px-2 py-1 rounded">src/features/order-management</code>
          </p>
          <p className="text-sm text-gray-500">
            Features include: Order list, order details, status updates, Kitchen Display System (KDS)
          </p>
        </div>
      </div>
    </div>
  );
}
