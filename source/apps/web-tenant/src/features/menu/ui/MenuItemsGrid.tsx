'use client';

import React from 'react';
import Image from 'next/image';
import { Card, Badge } from '@/shared/components/ui';
import { ImageIcon, Edit, Trash2, Star, Leaf, Flame, Milk, Plus } from './icons';
import { getImageUrl } from '../utils/getImageUrl';
import { CURRENCY_CONFIG } from '@/config/currency';

type MenuItemsGridProps = {
  items: any[];
  searchQuery: string;
  onEditItem: (e: React.MouseEvent, item: any) => void;
  onDeleteItem: (e: React.MouseEvent, item: any) => void;
  onAddItem: () => void;
};

function getDietaryIcon(tag: string) {
  switch (tag) {
    case 'vegan':
      return <Leaf className="w-3 h-3" />;
    case 'spicy':
      return <Flame className="w-3 h-3" />;
    case 'vegetarian':
      return <Milk className="w-3 h-3" />;
    default:
      return null;
  }
}

export function MenuItemsGrid({
  items,
  searchQuery,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: MenuItemsGridProps) {
  return (
    <div className="p-5">
      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No items found' : 'No items yet'}
          </h4>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Add your first menu item'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAddItem}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold"
            >
              <Plus className="w-5 h-5 inline-block mr-2" />
              Add Item
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-xl">
                {/* Hero Image - Full width, fixed height */}
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <>
                      <Image
                        src={getImageUrl(item.imageUrl) || ''}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                    </>
                  ) : (
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  )}
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                    {/* Category Badge */}
                    {item.categoryName && (
                      <span className="text-xs font-semibold text-gray-700 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                        {item.categoryName}
                      </span>
                    )}
                    
                    {/* Status Badge */}
                    {item.status && (
                      <span className={`text-xs font-semibold px-2.5 py-1 backdrop-blur-sm rounded-md shadow-sm ${
                        item.status === 'PUBLISHED' ? 'bg-emerald-500/90 text-white' :
                        item.status === 'DRAFT' ? 'bg-amber-500/90 text-white' :
                        'bg-gray-500/90 text-white'
                      }`}>
                        {item.status === 'PUBLISHED' ? 'Published' :
                         item.status === 'DRAFT' ? 'Draft' : 'Archived'}
                      </span>
                    )}
                  </div>
                  
                  {/* Chef's Pick Badge - Bottom Left */}
                  {item.chefRecommended && (
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-sm text-white rounded-md shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span className="text-xs font-semibold">Chef&apos;s Pick</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="py-3 px-3 flex-1 flex flex-col">
                  {/* Title */}
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {item.name}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.description || 'No description available'}
                  </p>

                  {/* Spacer to push badges to bottom */}
                  <div className="flex-1" />

                  {/* Chips Row: Availability, Order, Dietary, Allergens */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant={item.available ? 'success' : 'neutral'} className="text-xs">
                      {item.available ? 'Available' : 'Unavailable'}
                    </Badge>
                    
                    {item.displayOrder !== undefined && (
                      <Badge variant="neutral" className="text-xs">
                        Order: {item.displayOrder}
                      </Badge>
                    )}
                    
                    {item.dietary && item.dietary.length > 0 && (
                      item.dietary.slice(0, 2).map((tag: string) => (
                        <div
                          key={tag}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            tag === 'spicy' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {getDietaryIcon(tag)}
                          <span className="capitalize">{tag}</span>
                        </div>
                      ))
                    )}
                    
                    {item.allergens && item.allergens.length > 0 && (
                      item.allergens.slice(0, 2).map((allergen: string) => (
                        <div
                          key={allergen}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                        >
                          <span className="capitalize">{allergen}</span>
                        </div>
                      ))
                    )}
                    
                    {/* Show count if more items exist */}
                    {((item.dietary?.length || 0) + (item.allergens?.length || 0)) > 4 && (
                      <Badge variant="neutral" className="text-xs">
                        +{((item.dietary?.length || 0) + (item.allergens?.length || 0)) - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Footer: Price and Actions */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                  <span className="text-2xl font-bold text-emerald-600">
                    {CURRENCY_CONFIG.format(item.price)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="w-9 h-9 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                      onClick={(e) => onEditItem(e, item)}
                      aria-label="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="w-9 h-9 bg-gray-100 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                      onClick={(e) => onDeleteItem(e, item)}
                      aria-label="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
