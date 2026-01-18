/**
 * Promotions Management Page
 * Admin interface to create and manage voucher codes
 */

'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Copy,
  Check,
  X,
  Tag,
  Percent,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { usePromotions, useDeletePromotion, useTogglePromotionActive } from '../hooks/usePromotions';
import { CreatePromotionModal } from './CreatePromotionModal';
import type { Promotion } from '../model/types';
import { formatDiscount, isPromoValid } from '../model/types';

export function PromotionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, isLoading, error } = usePromotions({ includeExpired: true });
  const deletePromo = useDeletePromotion();
  const toggleActive = useTogglePromotionActive();

  const promotions = data?.promotions || [];

  // Filter by search
  const filteredPromotions = promotions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (promo: Promotion) => {
    if (promo.usageCount > 0) {
      alert('Cannot delete a code that has been used. Please deactivate it instead.');
      return;
    }
    if (confirm(`Delete code "${promo.code}"?`)) {
      deletePromo.mutate(promo.id);
    }
  };

  const handleToggleActive = (promo: Promotion) => {
    toggleActive.mutate({ id: promo.id, active: !promo.active });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-500 mt-1">
            Create and manage vouchers for customers
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Code
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search discount codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Total Codes</div>
          <div className="text-2xl font-bold text-gray-900">{promotions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {promotions.filter((p) => isPromoValid(p)).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Expired</div>
          <div className="text-2xl font-bold text-gray-400">
            {promotions.filter((p) => new Date(p.expiresAt) < new Date()).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Total Uses</div>
          <div className="text-2xl font-bold text-blue-600">
            {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {isLoading && (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          Error: {(error as Error).message}
        </div>
      )}

      {/* Promotions List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredPromotions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? 'No discount codes found' : 'No discount codes yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create First Code →
                </button>
              )}
            </div>
          )}

          {filteredPromotions.map((promo) => {
            const valid = isPromoValid(promo);
            const expired = new Date(promo.expiresAt) < new Date();
            const usageExceeded = promo.usageLimit && promo.usageCount >= promo.usageLimit;

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl border p-4 ${
                  valid ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Code & Type */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                          {promo.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Status badges */}
                      {valid && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Active
                        </span>
                      )}
                      {expired && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded">
                          Expired
                        </span>
                      )}
                      {usageExceeded && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          No uses left
                        </span>
                      )}
                      {!promo.active && !expired && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                          Deactivated
                        </span>
                      )}
                    </div>

                    {promo.description && (
                      <p className="text-gray-500 text-sm mt-1">{promo.description}</p>
                    )}
                  </div>

                  {/* Discount Value */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <Percent className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-700 text-lg">
                      {formatDiscount(promo)}
                    </span>
                    {promo.maxDiscount && promo.type === 'PERCENTAGE' && (
                      <span className="text-xs text-blue-500">
                        (max {promo.maxDiscount.toLocaleString()}đ)
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(promo.startsAt)} - {formatDate(promo.expiresAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {promo.usageCount}
                        {promo.usageLimit ? `/${promo.usageLimit}` : ''} uses
                      </span>
                    </div>
                    {promo.minOrderValue && (
                      <span className="text-xs">
                        Min order: {promo.minOrderValue.toLocaleString()}đ
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(promo)}
                      className={`p-2 rounded-lg transition-colors ${
                        promo.active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={promo.active ? 'Deactivate' : 'Activate'}
                    >
                      {promo.active ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>

                    <button
                      onClick={() => setEditingPromo(promo)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 text-gray-500" />
                    </button>

                    <button
                      onClick={() => handleDelete(promo)}
                      disabled={promo.usageCount > 0}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={promo.usageCount > 0 ? 'Cannot delete used code' : 'Delete'}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPromo) && (
        <CreatePromotionModal
          promotion={editingPromo}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPromo(null);
          }}
        />
      )}
    </div>
  );
}
