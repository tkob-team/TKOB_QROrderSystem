'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/shared/components';
import { useMenuPreviewController } from '@/features/menu/hooks';
import { Search, ChevronRight } from 'lucide-react';

// Customer-facing menu preview - no authentication required
// Accessed via QR code scan: /menu or /menu?table=5
export function MenuPreviewPage() {
  const { data: menuItems = [] } = useMenuPreviewController();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Normalize data shape from query (array or { data })
  const itemsArray = useMemo<any[]>(() => {
    // If API returns pagination wrapper { data, meta }
    if (menuItems && typeof menuItems === 'object' && !Array.isArray(menuItems) && 'data' in menuItems) {
      return ((menuItems as any).data as any[]) || [];
    }
    return (menuItems as any[]) || [];
  }, [menuItems]);

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string; itemCount: number }>();
    
    itemsArray.forEach(item => {
      if (item.available) {
        const catId = item.categoryId;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            name: item.category?.name || catId,
            itemCount: 0,
          });
        }
        const cat = categoryMap.get(catId)!;
        cat.itemCount++;
      }
    });
    
    return Array.from(categoryMap.values());
  }, [itemsArray]);

  // Filter items by search and category
  const filteredItems = useMemo(() => {
    return itemsArray
      .filter(item => item.available) // Only show available items
      .filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      })
      .filter(item => {
        if (!selectedCategory) return true;
        return item.categoryId === selectedCategory;
      });
  }, [itemsArray, searchQuery, selectedCategory]);

  // Group by category
  const groupedItems = useMemo(() => {
    if (selectedCategory) {
      return { [selectedCategory]: filteredItems };
    }
    
    return categories.reduce((acc, cat) => {
      acc[cat.id] = filteredItems.filter(item => item.categoryId === cat.id);
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [selectedCategory, filteredItems, categories]);

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">TK</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TKOB Restaurant</h1>
              <p className="text-sm text-gray-600">Browse our menu</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-37 z-10 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({cat.itemCount})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {Object.entries(groupedItems).map(([catId, items]) => {
          if (items.length === 0) return null;
          const category = categories.find(c => c.id === catId);
          if (!category) return null;

          return (
            <div key={catId} className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <Card
                    key={item.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Placeholder for image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className="text-emerald-600 font-bold ml-2">${item.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-semibold text-emerald-600">TKQR</span>
          </p>
        </div>
      </div>
    </div>
  );
}
