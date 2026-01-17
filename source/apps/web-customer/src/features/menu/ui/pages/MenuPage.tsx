'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, UtensilsCrossed, Search, ChevronLeft, ChevronRight, ArrowUpDown, X } from 'lucide-react'
import { FoodCard, EmptyState, MenuPageSkeleton } from '@/shared/components'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { useCart } from '@/shared/hooks/useCart'
import { usePagination } from '@/shared/hooks/usePagination'
import { useMenu } from '@/features/menu/hooks'
import { useSession } from '@/features/tables/hooks'
import { FeatureErrorBoundary } from '@/shared/components/error'
import { ITEMS_PER_PAGE, MENU_TEXT, type SortOption } from '../../model'

export function MenuPage() {
  const router = useRouter()
  const { itemCount } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('displayOrder')
  const [filterChefRecommended, setFilterChefRecommended] = useState<boolean>(false)
  const [showSortSheet, setShowSortSheet] = useState<boolean>(false)

  // Fetch session info (table number, etc.)
  const { session, loading: sessionLoading } = useSession()

  // Fetch menu data (uses session cookie automatically)
  const { data: menuItems, isLoading, error } = useMenu()

  // Extract unique categories
  const categories = useMemo(() => {
    if (!menuItems) return []
    const cats = new Set(menuItems.map(item => item.category))
    return Array.from(cats)
  }, [menuItems])

  // Filter
  const filteredItems = useMemo(() => {
    if (!menuItems) return []
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchesChefRecommended = !filterChefRecommended || item.chefRecommended
      return matchesSearch && matchesCategory && matchesChefRecommended
    })
  }, [menuItems, searchQuery, selectedCategory, filterChefRecommended])

  // Sort
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems]
    
    switch (sortBy) {
      case 'popularity-asc':
        return sorted.sort((a, b) => (a.popularity || 0) - (b.popularity || 0))
      case 'popularity-desc':
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      case 'price-asc':
        return sorted.sort((a, b) => a.basePrice - b.basePrice)
      case 'price-desc':
        return sorted.sort((a, b) => b.basePrice - a.basePrice)
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'displayOrder':
      default:
        return sorted
    }
  }, [filteredItems, sortBy])

  const pagination = usePagination({ items: sortedItems, itemsPerPage: ITEMS_PER_PAGE })

  // Handle ESC key to close bottom sheet
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSortSheet) {
        setShowSortSheet(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showSortSheet])

  // Show loading skeleton while session or menu data is loading
  if (sessionLoading || isLoading) {
    return <MenuPageSkeleton />
  }

  // Error handled by ErrorBoundary wrapper
  if (error) {
    throw error
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="max-w-4xl mx-auto flex justify-between items-center px-4 py-2">
            <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--orange-500)', fontSize: '12px' }}>🍽️</div>
              <span style={{ color: 'var(--gray-900)' }}>Restaurant</span>
            </div>
            <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
              {sessionLoading ? '...' : `${MENU_TEXT.table} ${session?.tableNumber || '-'}`} · 2 {MENU_TEXT.guests}
            </p>
            </div>
            <button
              onClick={() => router.push('/cart')}
              className="relative w-10 h-10 rounded-full flex items-center justify-center border transition-colors hover:bg-(--gray-50)"
              style={{ borderColor: 'var(--gray-300)' }}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--orange-500)', fontSize: '11px' }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto px-4 py-2 pb-2 hide-scrollbar">
          <div className="max-w-4xl mx-auto flex gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-(--orange-500) text-white' : 'bg-white border text-(--gray-700) hover:bg-(--gray-50)'}`}
              style={selectedCategory !== 'All' ? { borderColor: 'var(--gray-300)' } : {}}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-(--orange-500) text-white' : 'bg-white border text-(--gray-700) hover:bg-(--gray-50)'}`}
                style={selectedCategory !== cat ? { borderColor: 'var(--gray-300)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--gray-400)' }} />
            <input
              type="text"
              placeholder={MENU_TEXT.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-(--orange-200) focus:border-(--orange-500)"
              style={{ borderColor: 'var(--gray-300)', fontSize: '15px' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Filters and Sort */}
          <div className="flex items-center gap-3 mb-4">
          {/* Chef Recommended Filter */}
          <div className="flex-1 flex items-center gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--gray-300)' }}>
            <input
              type="checkbox"
              id="chefRecommendedFilter"
              checked={filterChefRecommended}
              onChange={(e) => setFilterChefRecommended(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: 'var(--orange-500)' }}
            />
            <label htmlFor="chefRecommendedFilter" className="flex-1 cursor-pointer" style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
              {MENU_TEXT.chefRecommended}
            </label>
          </div>

          {/* Sort Bottom Sheet Button */}
          <button
            onClick={() => setShowSortSheet(true)}
            className="px-4 py-3 rounded-lg border flex items-center gap-2 transition-all hover:bg-(--gray-50)"
            style={{ borderColor: 'var(--gray-300)' }}
          >
            <ArrowUpDown className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
            <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>{MENU_TEXT.sort}</span>
          </button>
          </div>

          {pagination.currentItems.length > 0 ? (
          <>
            <div className="space-y-3">
              {pagination.currentItems.map(item => (
                <FoodCard key={item.id} item={item} onAdd={(item) => router.push(`/menu/${item.id}`)} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={pagination.prevPage}
                  disabled={!pagination.hasPrev}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--gray-50)"
                  style={{ borderColor: 'var(--gray-300)' }}
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
                  <span style={{ color: 'var(--gray-700)', fontSize: '15px' }}>{MENU_TEXT.previous}</span>
                </button>
                <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                  {MENU_TEXT.page} {pagination.currentPage} {MENU_TEXT.of} {pagination.totalPages}
                </span>
                <button
                  onClick={pagination.nextPage}
                  disabled={!pagination.hasNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--gray-50)"
                  style={{ borderColor: 'var(--gray-300)' }}
                >
                  <span style={{ color: 'var(--gray-700)', fontSize: '15px' }}>{MENU_TEXT.next}</span>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<UtensilsCrossed className="w-16 h-16" />}
            title={MENU_TEXT.noDishes}
            message="Check back soon!"
            actionLabel={MENU_TEXT.clearFilters}
            onAction={() => { setSearchQuery(''); setSelectedCategory('All'); setFilterChefRecommended(false); }}
          />
          )}
        </div>
      </div>

      {/* Sort Bottom Sheet */}
      {showSortSheet && (
        <div 
          className="fixed inset-0 z-40 flex items-end"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setShowSortSheet(false)}
        >
          <div 
            className="w-full rounded-t-3xl bg-white"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '70vh', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="rounded-full"
                style={{ width: '36px', height: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--gray-900)' }}>
                {MENU_TEXT.sortButton}
              </h3>
              <button
                onClick={() => setShowSortSheet(false)}
                className="p-1 hover:bg-(--gray-100) rounded-full transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="px-4 pb-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              {(
                [
                  { key: 'displayOrder', label: MENU_TEXT.displayOrder },
                  { key: 'popularity-asc', label: MENU_TEXT.popularityAsc },
                  { key: 'popularity-desc', label: MENU_TEXT.popularityDesc },
                  { key: 'price-asc', label: MENU_TEXT.priceAsc },
                  { key: 'price-desc', label: MENU_TEXT.priceDesc },
                  { key: 'name-asc', label: MENU_TEXT.nameAsc },
                  { key: 'name-desc', label: MENU_TEXT.nameDesc },
                ] as Array<{ key: SortOption; label: string }>
              ).map(option => (
                <button
                  key={option.key}
                  onClick={() => {
                    setSortBy(option.key)
                    setShowSortSheet(false)
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all min-h-11 flex items-center ${
                    sortBy === option.key
                      ? 'text-white'
                      : 'border text-(--gray-700) hover:bg-(--gray-50)'
                  }`}
                  style={
                    sortBy === option.key
                      ? { backgroundColor: 'var(--orange-500)', border: 'none' }
                      : { borderColor: 'var(--gray-300)' }
                  }
                >
                  <span style={{ fontSize: '15px', fontWeight: sortBy === option.key ? '500' : '400' }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </div>
    </PageTransition>
  )
}
