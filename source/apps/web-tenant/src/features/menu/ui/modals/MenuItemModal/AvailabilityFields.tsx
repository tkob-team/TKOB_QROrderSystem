import React from 'react';
import { DIETARY_TAG_OPTIONS, ALLERGEN_OPTIONS, STATUS_OPTIONS } from '../../../constants';
import type { MenuItemFormData, MenuItemStatus, DietaryTag, Allergen } from '../../../model/types';

interface AvailabilityFieldsProps {
  formData: MenuItemFormData;
  onFormChange: (data: MenuItemFormData) => void;
}

export function AvailabilityFields({ formData, onFormChange }: AvailabilityFieldsProps) {
  const toggleDietary = (tag: DietaryTag) => {
    const newDietary = formData.dietary.includes(tag)
      ? formData.dietary.filter((value) => value !== tag)
      : [...formData.dietary, tag];
    onFormChange({ ...formData, dietary: newDietary });
  };

  const toggleAllergen = (allergen: Allergen) => {
    const newAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter((value) => value !== allergen)
      : [...formData.allergens, allergen];
    onFormChange({ ...formData, allergens: newAllergens });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Status *</label>
        <select
          value={formData.status}
          onChange={(event) =>
            onFormChange({
              ...formData,
              status: event.target.value as MenuItemStatus,
            })
          }
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">Available (In Stock)</span>
          <span className="text-xs text-gray-500">Mark this item as available for ordering</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(event) => onFormChange({ ...formData, available: event.target.checked })}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full relative transition-colors ${
              formData.available ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                formData.available ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Dietary Tags</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TAG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleDietary(option.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                formData.dietary.includes(option.value)
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">Allergens</label>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleAllergen(option.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                formData.allergens.includes(option.value)
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">Mark as Chef&apos;s recommendation</span>
          <span className="text-xs text-gray-500">Highlight this item to customers</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.chefRecommended}
            onChange={(event) => onFormChange({ ...formData, chefRecommended: event.target.checked })}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full relative transition-colors ${
              formData.chefRecommended ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                formData.chefRecommended ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>
    </>
  );
}
