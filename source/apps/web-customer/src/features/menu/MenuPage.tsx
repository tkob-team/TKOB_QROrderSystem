'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, UtensilsCrossed, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { LanguageSwitcher, FoodCard, EmptyState, MenuPageSkeleton } from '@/components'
import { useLanguage } from '@/hooks/useLanguage'
import { useCart } from '@/hooks/useCart'
import { usePagination } from '@/hooks/usePagination'
import { useMenu } from '@/hooks/useMenu'
import { useSession } from '@/hooks/useSession'
import { FeatureErrorBoundary } from '@/components/error'

const ITEMS_PER_PAGE = 6

export function MenuPage() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const { itemCount } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'default' | 'popular'>('default')

  // Fetch session info (table number, etc.)
  const { session, loading: sessionLoading } = useSession()

  // Fetch menu data (session cookie provides tenant context)
  const { data: menuItems, isLoading, error } = useMenu(session?.tenantId)

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
      return matchesSearch && matchesCategory
    })
  }, [menuItems, searchQuery, selectedCategory])

  // Sort
  const sortedItems = useMemo(() => {
    return sortBy === 'popular'
      ? [...filteredItems].sort((a, b) => {
          const aIsPopular = a.badge === 'Popular' ? 1 : 0
          const bIsPopular = b.badge === 'Popular' ? 1 : 0
          return bIsPopular - aIsPopular
        })
      : filteredItems
  }, [filteredItems, sortBy])

  const pagination = usePagination({ items: sortedItems, itemsPerPage: ITEMS_PER_PAGE })

  const text = {
    EN: {
      table: 'Table', guests: 'guests', searchPlaceholder: 'Search dishes...',
      sort: 'Sort:', default: 'Default', popular: 'Most popular',
      previous: 'Previous', next: 'Next', page: 'Page', of: 'of',
      noDishes: 'No dishes found', clearFilters: 'Clear filters',
    },
    VI: {
      table: 'Bàn', guests: 'khách', searchPlaceholder: 'Tìm món ăn...',
      sort: 'Sắp xếp:', default: 'Mặc định', popular: 'Phổ biến nhất',
      previous: 'Trước', next: 'Sau', page: 'Trang', of: 'của',
      noDishes: 'Không tìm thấy món nào', clearFilters: 'Xóa bộ lọc',
    },
  }

  const t = text[language]

  // Show loading skeleton
  if (isLoading || sessionLoading) {
    return <MenuPageSkeleton />
  }

  // Error handled by ErrorBoundary wrapper
  if (error) {
    throw error
  }

  return (
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
              {sessionLoading ? '...' : `${t.table} ${session?.tableNumber || '-'}`} · 2 {t.guests}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
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
        <div className="overflow-x-auto px-4 pb-2 hide-scrollbar">
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
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-(--orange-200) focus:border-(--orange-500)"
              style={{ borderColor: 'var(--gray-300)', fontSize: '15px' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
        {/* Sort */}
        <div className="flex justify-end items-center mb-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
            <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.sort}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSortBy('default')}
                className={`px-3 py-1.5 rounded-full transition-all ${sortBy === 'default' ? 'bg-(--orange-500) text-white' : 'bg-white border text-(--gray-700) hover:bg-(--gray-50)'}`}
                style={sortBy !== 'default' ? { borderColor: 'var(--gray-300)', fontSize: '13px' } : { fontSize: '13px' }}
              >
                {t.default}
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-full transition-all ${sortBy === 'popular' ? 'bg-(--orange-500) text-white' : 'bg-white border text-(--gray-700) hover:bg-(--gray-50)'}`}
                style={sortBy !== 'popular' ? { borderColor: 'var(--gray-300)', fontSize: '13px' } : { fontSize: '13px' }}
              >
                {t.popular}
              </button>
            </div>
          </div>
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
                  <span style={{ color: 'var(--gray-700)', fontSize: '15px' }}>{t.previous}</span>
                </button>
                <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                  {t.page} {pagination.currentPage} {t.of} {pagination.totalPages}
                </span>
                <button
                  onClick={pagination.nextPage}
                  disabled={!pagination.hasNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--gray-50)"
                  style={{ borderColor: 'var(--gray-300)' }}
                >
                  <span style={{ color: 'var(--gray-700)', fontSize: '15px' }}>{t.next}</span>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<UtensilsCrossed className="w-16 h-16" />}
            title={t.noDishes}
            message="Check back soon!"
            actionLabel={t.clearFilters}
            onAction={() => { setSearchQuery(''); setSelectedCategory('All') }}
          />
        )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
