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
        <label className="text-text-primary text-sm font-semibold">
          Table Name (auto-generated from Table Number)
        </label>
        <input
          type="text"
          value={formData.name}
          disabled={true}
          placeholder="Auto-generated from Table Number"
          className="px-4 py-3 border border-default bg-elevated text-text-tertiary placeholder-text-tertiary cursor-not-allowed focus:outline-none transition-all rounded-[4px] h-12 text-[15px]"
          autoFocus={autoFocus}
        />
        <p className="text-text-tertiary text-xs">
          This field is automatically set based on the Table Number you enter below.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-text-primary text-sm font-semibold">
          Table Number *
        </label>
        <input
          type="number"
          value={formData.tableNumber}
          onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
          placeholder="e.g., 13"
          min="1"
          max="100"
          className="px-4 py-3 border border-default bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all rounded-[4px] h-12 text-[15px]"
          autoFocus={autoFocus && !disableTableName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-text-primary text-sm font-semibold">
          Capacity (seats) *
        </label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          placeholder="e.g., 4"
          min="1"
          max="20"
          className="px-4 py-3 border border-default bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all rounded-[4px] h-12 text-[15px]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-text-primary text-sm font-semibold">
          Location/Zone
        </label>
        <div className="relative">
          <select
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            className="w-full px-4 py-3 pr-10 border border-default bg-white text-text-primary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all appearance-none rounded-[4px] h-12 text-[15px]"
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="patio">Patio</option>
            <option value="vip">VIP Room</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-text-primary text-sm font-semibold">
          Status
        </label>
        <div className="relative">
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'reserved' | 'inactive' })}
            className="w-full px-4 py-3 pr-10 border border-default bg-white text-text-primary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all appearance-none rounded-[4px] h-12 text-[15px]"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-text-primary text-sm font-semibold">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Near the window, has a view of the garden"
          className="px-4 py-3 border border-default bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all resize-vertical rounded-[4px] min-h-24 text-[15px]"
          rows={3}
        />
      </div>
    </>
  );
}
