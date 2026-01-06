'use client';

import React from 'react';
import { X } from '../icons';

type CategoryModalProps = {
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  register: any;
  handleSubmit: any;
  errors: any;
  isSubmitting: boolean;
  isValid: boolean;
  watch: any;
};

export function CategoryModal({
  isOpen,
  isEditing,
  onClose,
  onSubmit,
  register,
  handleSubmit,
  errors,
  isSubmitting,
  isValid,
  watch,
}: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
          {/* Category name field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">
              Category name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Specials"
              {...register('name')}
              className={`px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Description (optional)</label>
            <textarea
              placeholder="Add a brief description..."
              rows={3}
              {...register('description')}
              className={`px-4 py-3 border rounded-xl text-sm resize-none focus:outline-none transition-colors ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Display Order field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Display Order (optional)</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="e.g., 1"
              {...register('displayOrder')}
              className={`px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                errors.displayOrder
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20'
              }`}
            />
            {errors.displayOrder && (
              <p className="text-xs text-red-600">{errors.displayOrder.message}</p>
            )}
          </div>

          {/* Status field */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-900">Status</label>
            <div className="space-y-2">
              {['ACTIVE', 'INACTIVE'].map((value) => {
                const isSelected = watch('status') === value;
                return (
                  <label
                    key={value}
                    className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...register('status')}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isSelected ? 'text-emerald-700' : 'text-gray-600'
                      }`}
                    >
                      {value === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.status && (
              <p className="text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Form buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
