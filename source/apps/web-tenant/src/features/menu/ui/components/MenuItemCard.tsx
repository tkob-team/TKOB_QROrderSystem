import React from 'react';
import { Image as ImageIcon, Star, Leaf, Flame, Edit, Trash2 } from 'lucide-react';
import type { DietaryTag } from '../../model/types';
import { getPrimaryPhotoUrl } from '../../model/types';

interface MenuItemCardProps {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onToggleAvailability?: (item: any) => void;
}

function getDietaryIcon(tag: DietaryTag) {
  switch (tag) {
    case 'vegetarian':
    case 'vegan':
      return <Leaf className="w-3 h-3" />;
    case 'spicy':
      return <Flame className="w-3 h-3" />;
    default:
      return null;
  }
}

function formatPrice(price: number, currency: 'VND' | 'USD' = 'USD'): string {
  if (currency === 'VND') return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  return '$' + price.toFixed(2);
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemCardProps) {
  let displayStatus: 'available' | 'sold_out' | 'unavailable' = 'available';
  const statusStr = String((item as any).status);
  if (statusStr === 'SOLD_OUT') displayStatus = 'sold_out';
  else if (!(item as any).isAvailable) displayStatus = 'unavailable';

  const isAvailable = displayStatus === 'available';
  const primaryPhotoUrl = getPrimaryPhotoUrl(item);

  return (
    <div className="bg-white rounded-lg border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[rgb(var(--primary-100))] to-[rgb(var(--neutral-100))] overflow-hidden">
        {primaryPhotoUrl ? (
          <img
            src={primaryPhotoUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-12 h-12 text-[rgb(var(--neutral-400))]" />
            <span className="text-xs text-[rgb(var(--neutral-500))]">No image</span>
          </div>
        )}

        {(() => {
          const status = item.status || 'DRAFT';
          const statusClasses =
            status === 'PUBLISHED'
              ? 'bg-emerald-500 text-white'
              : status === 'DRAFT'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-500 text-white';
          const statusText = status === 'PUBLISHED' ? 'Published' : status === 'DRAFT' ? 'Draft' : 'Archived';
          return (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-md text-[11px] font-semibold ${statusClasses}`}>
              {statusText}
            </div>
          );
        })()}

        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-md text-[11px] font-semibold ${
            isAvailable
              ? 'bg-[rgb(var(--success))] text-white'
              : displayStatus === 'sold_out'
              ? 'bg-[rgb(var(--error))] text-white'
              : 'bg-[rgb(var(--neutral-500))] text-white'
          }`}
        >
          {isAvailable ? 'Available' : displayStatus === 'sold_out' ? 'Sold Out' : 'Unavailable'}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-lg font-semibold text-[rgb(var(--neutral-900))] line-clamp-1 mb-1">{item.name}</h4>

        {item.categoryName && (
          <span className="inline-flex w-fit self-start items-center gap-1 px-2 py-0.5 mb-2 bg-blue-50 text-blue-700 rounded-md text-[11px] font-semibold border border-blue-100">
            {item.categoryName}
          </span>
        )}

        <p className="text-sm text-[rgb(var(--neutral-600))] line-clamp-2 mb-3 min-h-[40px]">
          {item.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-[rgb(var(--neutral-900))]">{formatPrice(item.price)}</span>
          {item.prepTime && (
            <span className="text-sm text-[rgb(var(--neutral-500))] flex items-center gap-1">⏱ {item.prepTime} min</span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-[rgb(var(--neutral-600))] mb-4">
          {item.rating ? (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[rgb(var(--warning))] text-[rgb(var(--warning))]" />
              <span className="font-medium">{item.rating}</span>
              <span className="text-[rgb(var(--neutral-400))]">({item.reviewsCount || 0})</span>
            </span>
          ) : (
            <span className="text-[rgb(var(--neutral-400))]">No ratings yet</span>
          )}
          {item.ordersCount !== undefined && <span className="text-[rgb(var(--neutral-500))]">{item.ordersCount} orders</span>}
        </div>

        {((item.chefRecommended) || (item.dietary && item.dietary.length > 0) || item.displayOrder !== undefined) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.chefRecommended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgb(var(--primary-100))] text-[rgb(var(--primary-700))] rounded-md text-xs font-medium">
                <Star className="w-3 h-3 fill-current" />
                Chef&apos;s Pick
              </span>
            )}
            {item.dietary?.slice(0, 2).map((tag: DietaryTag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  tag === 'spicy'
                    ? 'bg-[rgb(var(--error-100))] text-[rgb(var(--error-700))]'
                    : 'bg-[rgb(var(--success-100))] text-[rgb(var(--success-700))]'
                }`}
              >
                {getDietaryIcon(tag)}
                <span className="capitalize">{tag}</span>
              </span>
            ))}
            {item.displayOrder !== undefined && (
              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-purple-50 text-purple-600 border border-purple-200">
                Order #{item.displayOrder}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-[rgb(var(--border))] mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="flex-1 h-9 bg-[rgb(var(--neutral-100))] hover:bg-[rgb(var(--neutral-200))] border border-[rgb(var(--border))] rounded-lg flex items-center justify-center gap-1.5 text-[rgb(var(--neutral-700))] hover:text-[rgb(var(--neutral-900))] transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="w-9 h-9 bg-[rgb(var(--neutral-100))] hover:bg-[rgb(var(--error-100))] border border-[rgb(var(--border))] hover:border-[rgb(var(--error-200))] rounded-lg flex items-center justify-center text-[rgb(var(--neutral-600))] hover:text-[rgb(var(--error-600))] transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onToggleAvailability && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAvailability(item);
              }}
              className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isAvailable
                  ? 'bg-[rgb(var(--success-100))] text-[rgb(var(--success-700))] hover:bg-[rgb(var(--success-200))]'
                  : 'bg-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--neutral-200))]'
              }`}
              title={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
            >
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--neutral-400))]'}`} />
              {isAvailable ? 'On' : 'Off'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
