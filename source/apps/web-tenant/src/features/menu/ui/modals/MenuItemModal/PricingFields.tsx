import React from 'react';
import type { MenuItemFormData } from '../../../model/types';

interface PricingFieldsProps {
  formData: MenuItemFormData;
  onFormChange: (data: MenuItemFormData) => void;
}

export function PricingFields({ formData, onFormChange }: PricingFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Price *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(event) => {
                const value = parseFloat(event.target.value);
                const finalValue = Number.isNaN(value) ? 0 : Math.max(0, value);
                onFormChange({ ...formData, price: finalValue });
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Prep Time (min)</label>
          <input
            type="number"
            value={formData.preparationTime || ''}
            onChange={(event) => {
              const value = parseInt(event.target.value, 10);
              const finalValue = Number.isNaN(value) ? 0 : Math.max(0, Math.min(240, value));
              onFormChange({ ...formData, preparationTime: finalValue });
            }}
            placeholder="0"
            min="0"
            max="240"
            className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Display Order</label>
        <input
          type="number"
          value={formData.displayOrder || ''}
          onChange={(event) => {
            const value = parseInt(event.target.value, 10);
            const finalValue = Number.isNaN(value) ? 0 : Math.max(0, value);
            onFormChange({ ...formData, displayOrder: finalValue });
          }}
          placeholder="0"
          min="0"
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>
    </>
  );
}
