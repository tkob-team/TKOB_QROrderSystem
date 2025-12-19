'use client';

import { ChevronDown } from 'lucide-react';

interface FormData {
  name: string;
  capacity: string;
  zone: string;
  tableNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  description: string;
}

interface TableFormFieldsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  autoFocus?: boolean;
  disableTableName?: boolean;
}

export function TableFormFields({ formData, setFormData, autoFocus = true, disableTableName = false }: TableFormFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
          Table Name (auto-generated from Table Number)
        </label>
        <input
          type="text"
          value={formData.name}
          disabled={true}
          placeholder="Auto-generated from Table Number"
          className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-500 placeholder-gray-400 cursor-not-allowed focus:outline-none transition-all"
          style={{ fontSize: '15px', borderRadius: '4px', height: '48px' }}
          autoFocus={autoFocus}
        />
        <p className="text-gray-500" style={{ fontSize: '12px' }}>
          This field is automatically set based on the Table Number you enter below.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
          Table Number *
        </label>
        <input
          type="number"
          value={formData.tableNumber}
          onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
          placeholder="e.g., 13"
          min="1"
          max="100"
          className="px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
          style={{ fontSize: '15px', borderRadius: '4px', height: '48px' }}
          autoFocus={autoFocus && !disableTableName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
          Capacity (seats) *
        </label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          placeholder="e.g., 4"
          min="1"
          max="20"
          className="px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
          style={{ fontSize: '15px', borderRadius: '4px', height: '48px' }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
          Location/Zone
        </label>
        <div className="relative">
          <select
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            className="w-full px-4 py-3 pr-10 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all appearance-none"
            style={{ fontSize: '15px', borderRadius: '4px', height: '48px' }}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="patio">Patio</option>
            <option value="vip">VIP Room</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
          Status
        </label>
        <div className="relative">
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'reserved' | 'inactive' })}
            className="w-full px-4 py-3 pr-10 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all appearance-none"
            style={{ fontSize: '15px', borderRadius: '4px', height: '48px' }}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Near the window, has a view of the garden"
          className="px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all resize-vertical"
          style={{ fontSize: '15px', borderRadius: '4px', minHeight: '96px' }}
          rows={3}
        />
      </div>
    </>
  );
}
