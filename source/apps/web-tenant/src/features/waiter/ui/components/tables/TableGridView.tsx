/**
 * Table Grid View Page
 * Full-page table overview for waiters
 */

'use client';

import React from 'react';
import { RefreshCw, LayoutGrid, List, Filter } from 'lucide-react';
import { useTableGridController } from '../../../hooks/useTableGridController';
import { TableCard } from './TableCard';
import { TableDetailPanel } from './TableDetailPanel';
import { TABLE_STATUS_CONFIG, TableViewStatus } from '../../../model/table-types';

export function TableGridView() {
  const { state, actions } = useTableGridController();

  const statusFilters: Array<{ value: TableViewStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'available', label: 'Available' },
    { value: 'needs-service', label: 'Needs Service' },
    { value: 'reserved', label: 'Reserved' },
  ];

  // Stats summary
  const stats = {
    total: state.tables.length,
    occupied: state.tables.filter((t) => t.status === 'occupied').length,
    available: state.tables.filter((t) => t.status === 'available').length,
    needsService: state.tables.filter((t) => t.status === 'needs-service').length,
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${state.selectedTable ? 'lg:pr-0' : ''}`}>
        {/* Header */}
        <header className="px-4 lg:px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table Layout</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.occupied}/{stats.total} tables occupied
                {stats.needsService > 0 && (
                  <span className="ml-2 text-amber-600 font-medium">
                    • {stats.needsService} tables need service
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => actions.setViewMode('grid')}
                  className={`p-2 rounded ${state.viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => actions.setViewMode('list')}
                  className={`p-2 rounded ${state.viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh button */}
              <button
                onClick={actions.refresh}
                disabled={state.isLoading}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => actions.setFilterStatus(filter.value)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${state.filterStatus === filter.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {filter.label}
                {filter.value !== 'all' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({state.tables.filter((t) => 
                      filter.value === 'all' || t.status === filter.value
                    ).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Table Grid */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {state.isLoading && (
            <div className="text-center py-12 text-gray-500">
              Loading...
            </div>
          )}

          {state.error && (
            <div className="text-center py-12 text-red-500">
              Error: {state.error.message}
            </div>
          )}

          {!state.isLoading && !state.error && state.tables.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tables</p>
            </div>
          )}

          {!state.isLoading && !state.error && state.tables.length > 0 && (
            state.viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {state.tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    selected={state.selectedTable?.id === table.id}
                    onSelect={actions.selectTable}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {state.tables.map((table) => {
                  const config = TABLE_STATUS_CONFIG[table.status];
                  return (
                    <button
                      key={table.id}
                      onClick={() => actions.selectTable(table)}
                      className={`
                        w-full p-4 bg-white rounded-lg border-2 flex items-center justify-between
                        hover:shadow-md transition-all text-left
                        ${config.borderColor}
                        ${state.selectedTable?.id === table.id ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <div className="font-bold">{table.name}</div>
                          <div className="text-sm text-gray-500">
                            {table.zone} • {table.capacity} chỗ
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${config.textColor}`}>
                          {config.label}
                        </div>
                        {table.activeOrders.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {table.activeOrders.length} đơn • {(table.totalSpent || 0).toLocaleString()}đ
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>

      {/* Detail Panel */}
      {state.selectedTable && (
        <div className="hidden lg:block w-96 flex-shrink-0">
          <TableDetailPanel
            table={state.selectedTable}
            onClose={() => actions.selectTable(null)}
            onClearTable={actions.clearTable}
            onStartOrder={actions.startManualOrder}
          />
        </div>
      )}

      {/* Mobile Detail Modal */}
      {state.selectedTable && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white">
            <TableDetailPanel
              table={state.selectedTable}
              onClose={() => actions.selectTable(null)}
              onClearTable={actions.clearTable}
              onStartOrder={actions.startManualOrder}
            />
          </div>
        </div>
      )}
    </div>
  );
}
