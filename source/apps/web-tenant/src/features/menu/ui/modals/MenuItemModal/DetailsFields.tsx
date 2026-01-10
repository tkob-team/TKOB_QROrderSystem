import React from 'react';
import type { MenuItemFormData, Category } from '../../../model/types';

interface DetailsFieldsProps {
  formData: MenuItemFormData;
  categories: Category[];
  onFormChange: (data: MenuItemFormData) => void;
}

export function DetailsFields({ formData, categories, onFormChange }: DetailsFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Item Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) => onFormChange({ ...formData, name: event.target.value })}
          placeholder="e.g., Caesar Salad"
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Category *</label>
        <select
          value={formData.categoryId}
          onChange={(event) => onFormChange({ ...formData, categoryId: event.target.value })}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Description</label>
        <textarea
          value={formData.description}
          onChange={(event) => onFormChange({ ...formData, description: event.target.value })}
          placeholder="Describe your dish..."
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-500"
          rows={3}
        />
      </div>
    </>
  );
}
