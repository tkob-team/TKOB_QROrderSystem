/**
 * Tenant Promotions Section
 * Manage voucher/promotion codes within Settings
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
  Tag,
  Percent,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Gift,
  TrendingUp,
} from 'lucide-react';
import {
  usePromotions,
  useDeletePromotion,
  useTogglePromotionActive,
  formatDiscount,
  isPromoValid,
} from '@/features/promotions';
import { CreatePromotionModal } from '@/features/promotions/ui/CreatePromotionModal';
import type { Promotion } from '@/features/promotions';

export function TenantPromotionsSection() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, isLoading } = usePromotions({ includeExpired: true });
  const deletePromo = useDeletePromotion();
  const toggleActive = useTogglePromotionActive();

  const promotions = data?.promotions || [];

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Stats
  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => isPromoValid(p)).length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usageCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-secondary rounded-xl p-6 border border-default">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Discount Codes</h2>
              <p className="text-sm text-text-secondary">Create and manage vouchers for customers</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Code
          </button>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-default">
          <div>
            <p className="text-sm text-text-secondary">Total Codes</p>
            <p className="text-xl font-bold text-text-primary">{stats.total}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Active</p>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total Uses</p>
            <p className="text-xl font-bold text-blue-600">{stats.totalUsage}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      {promotions.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search discount codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-default rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-text-secondary">Loading...</div>
      )}

      {/* Empty State */}
      {!isLoading && promotions.length === 0 && (
        <div className="text-center py-12 bg-surface-secondary rounded-xl border border-default">
          <Tag className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary mb-2">No discount codes yet</p>
          <p className="text-sm text-text-secondary mb-4">
            Create codes to attract customers and boost sales
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            Create First Code →
          </button>
        </div>
      )}

      {/* Promotions List */}
      {!isLoading && filteredPromotions.length > 0 && (
        <div className="space-y-3">
          {filteredPromotions.map((promo) => {
            const valid = isPromoValid(promo);
            const expired = new Date(promo.expiresAt) < new Date();

            return (
              <div
                key={promo.id}
                className={`bg-surface-secondary rounded-xl border p-4 ${
                  valid ? 'border-green-200' : 'border-default'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Code & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-bold text-text-primary bg-surface-primary px-2 py-1 rounded text-sm">
                        {promo.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="p-1 hover:bg-surface-primary rounded transition-colors"
                      >
                        {copiedCode === promo.code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-text-secondary" />
                        )}
                      </button>
                      {valid && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Hoạt động
                        </span>
                      )}
                      {expired && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          Hết hạn
                        </span>
                      )}
                      {!promo.active && !expired && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                          Đã tắt
                        </span>
                      )}
                    </div>
                    {promo.description && (
                      <p className="text-sm text-text-secondary mt-1 truncate">
                        {promo.description}
                      </p>
                    )}
                  </div>

                  {/* Discount Value */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg shrink-0">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-blue-700">
                      {formatDiscount(promo)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary shrink-0">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(promo.expiresAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive.mutate({ id: promo.id, active: !promo.active })}
                      className={`p-1.5 rounded transition-colors ${
                        promo.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {promo.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setEditingPromo(promo)}
                      className="p-1.5 hover:bg-surface-primary rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo)}
                      disabled={promo.usageCount > 0}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">How to use discount codes</p>
            <ul className="mt-1 text-blue-700 space-y-1">
              <li>• Share codes via social media, email, or print on receipts</li>
              <li>• Set usage limits to control promotional costs</li>
              <li>• Use seasonal/event codes (TET2025, NOEL, SUMMER...)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
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
