/**
 * Create/Edit Promotion Modal
 * Form for creating and editing voucher codes
 */

'use client';

import React, { useState } from 'react';
import { X, Tag, Percent, Calendar, DollarSign, Users, Info } from 'lucide-react';
import { useCreatePromotion, useUpdatePromotion } from '../hooks/usePromotions';
import type { Promotion, PromotionType, CreatePromotionInput } from '../model/types';

interface CreatePromotionModalProps {
  promotion?: Promotion | null;
  onClose: () => void;
}

export function CreatePromotionModal({ promotion, onClose }: CreatePromotionModalProps) {
  const isEditing = !!promotion;
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();

  // Form state
  const [formData, setFormData] = useState({
    code: promotion?.code || '',
    description: promotion?.description || '',
    type: (promotion?.type || 'PERCENTAGE') as PromotionType,
    value: promotion?.value || 10,
    minOrderValue: promotion?.minOrderValue || 0,
    maxDiscount: promotion?.maxDiscount || 0,
    usageLimit: promotion?.usageLimit || 0,
    startsAt: promotion
      ? new Date(promotion.startsAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    expiresAt: promotion
      ? new Date(promotion.expiresAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 30 days
    active: promotion?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Please enter discount code';
    } else if (!/^[A-Za-z0-9]{3,20}$/.test(formData.code)) {
      newErrors.code = 'Code must be 3-20 characters, letters and numbers only';
    }

    if (formData.type === 'PERCENTAGE') {
      if (formData.value <= 0 || formData.value > 100) {
        newErrors.value = 'Percentage must be between 1-100%';
      }
    } else {
      if (formData.value <= 0) {
        newErrors.value = 'Discount amount must be greater than 0';
      }
    }

    if (new Date(formData.expiresAt) <= new Date(formData.startsAt)) {
      newErrors.expiresAt = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const data: CreatePromotionInput = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description || undefined,
      type: formData.type,
      value: formData.value,
      minOrderValue: formData.minOrderValue || undefined,
      maxDiscount: formData.type === 'PERCENTAGE' ? formData.maxDiscount || undefined : undefined,
      usageLimit: formData.usageLimit || undefined,
      startsAt: new Date(formData.startsAt).toISOString(),
      expiresAt: new Date(formData.expiresAt).toISOString(),
      active: formData.active,
    };

    try {
      if (isEditing && promotion) {
        await updatePromo.mutateAsync({
          id: promotion.id,
          data: {
            description: data.description,
            minOrderValue: data.minOrderValue,
            maxDiscount: data.maxDiscount,
            usageLimit: data.usageLimit,
            startsAt: data.startsAt,
            expiresAt: data.expiresAt,
            active: data.active,
          },
        });
      } else {
        await createPromo.mutateAsync(data);
      }
      onClose();
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already exists')) {
        setErrors({ code: 'This code already exists' });
      } else {
        setErrors({ submit: error.response?.data?.message || 'An error occurred' });
      }
    }
  };

  const isSubmitting = createPromo.isPending || updatePromo.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Discount Code' : 'Create New Discount Code'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                disabled={isEditing}
                placeholder="VD: SUMMER20, WELCOME10"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                  errors.code ? 'border-red-500' : 'border-gray-200'
                } ${isEditing ? 'bg-gray-100' : ''}`}
              />
            </div>
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="E.g.: Summer discount"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
            />
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={isEditing}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <div className="relative">
                {formData.type === 'PERCENTAGE' ? (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                  disabled={isEditing}
                  min={1}
                  max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                    errors.value ? 'border-red-500' : 'border-gray-200'
                  } ${isEditing ? 'bg-gray-100' : ''}`}
                />
              </div>
              {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Order (đ)
              </label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => handleChange('minOrderValue', parseFloat(e.target.value) || 0)}
                min={0}
                step={10000}
                placeholder="0 = no limit"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>

            {formData.type === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount (đ)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => handleChange('maxDiscount', parseFloat(e.target.value) || 0)}
                  min={0}
                  step={10000}
                  placeholder="0 = no limit"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleChange('usageLimit', parseInt(e.target.value) || 0)}
                min={0}
                placeholder="0 = no limit"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => handleChange('startsAt', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl ${
                  errors.expiresAt ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.expiresAt && <p className="text-red-500 text-sm mt-1">{errors.expiresAt}</p>}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Activate Immediately</p>
              <p className="text-sm text-gray-500">Code will be effective upon creation</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('active', !formData.active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.active ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Tips */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Tips for effective codes:</p>
              <ul className="mt-1 list-disc list-inside text-blue-600">
                <li>Short, memorable code (e.g.: SALE20, TET2025)</li>
                <li>Set usage limit to control costs</li>
                <li>Set min order to increase order value</li>
              </ul>
            </div>
          </div>

          {/* Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : isEditing ? 'Save Changes' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
