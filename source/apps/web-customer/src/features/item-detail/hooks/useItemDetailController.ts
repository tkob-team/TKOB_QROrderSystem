"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { MenuItem } from '@/types'
import { useCart } from '@/shared/hooks/useCart'
import { useSession } from '@/features/tables/hooks'
import { useItemDetailQuery, useMenuItemsQuery, useItemReviewsQuery } from './queries/useItemDetailQueries'
import type { ItemDetailController } from '../model'

const REVIEWS_PER_PAGE = 3

export function useItemDetailController(itemId: string): ItemDetailController {
  const router = useRouter()
  const { addItem } = useCart()
  const { session } = useSession()
  const tenantId = session?.tenantId

  const { data: item, isLoading, error } = useItemDetailQuery(itemId)
  const { data: allMenuItems = [] } = useMenuItemsQuery(tenantId)
  
  // FEAT-02: Fetch reviews from API instead of relying on item.reviews
  const { data: reviewsData } = useItemReviewsQuery(itemId, tenantId)

  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({}) // groupId -> optionIds[]
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviewPage, setReviewPage] = useState(1)
  const [showFullReviewList, setShowFullReviewList] = useState(false)

  // Initialize selected size when item loads
  useEffect(() => {
    if (item && !selectedSize && item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0].size)
    }
  }, [item, selectedSize])

  // Reset review page when item changes
  useEffect(() => {
    setReviewPage(1)
    setShowFullReviewList(false)
  }, [item])

  // Related Items: Mixed strategy - same category + best sellers as fallback
  const relatedItems = useMemo(() => {
    if (!item) return [] as MenuItem[]
    
    // Get current item's category - could be string (mock) or from backend (categoryId)
    const currentCategory = item.category
    const currentCategoryId = (item as any).categoryId
    
    // Helper: filter by availability
    const isAvailable = (menuItem: MenuItem) => 
      menuItem.availability === 'Available' || !menuItem.availability
    
    // Helper: check category match
    const isSameCategory = (menuItem: MenuItem) => 
      (currentCategory && menuItem.category === currentCategory) ||
      (currentCategoryId && (menuItem as any).categoryId === currentCategoryId)
    
    // 1. Get items from same category (primary)
    const sameCategoryItems = allMenuItems
      .filter((menuItem) => {
        if (menuItem.id === item.id) return false
        if (!isSameCategory(menuItem)) return false
        return isAvailable(menuItem)
      })
      .slice(0, 4)
    
    // 2. If we have enough, return early
    if (sameCategoryItems.length >= 4) {
      return sameCategoryItems
    }
    
    // 3. Fill remaining slots with "best sellers" / popular items from other categories
    // Sort by rating average (descending) as proxy for popularity
    const remainingSlots = 4 - sameCategoryItems.length
    const sameCategoryIds = new Set([item.id, ...sameCategoryItems.map(i => i.id)])
    
    const popularItems = allMenuItems
      .filter((menuItem) => {
        if (sameCategoryIds.has(menuItem.id)) return false
        return isAvailable(menuItem)
      })
      .sort((a, b) => {
        // Sort by rating average (higher first), then by price (lower first for accessibility)
        const ratingA = (a as any).ratingAvg || (a as any).rating || 0
        const ratingB = (b as any).ratingAvg || (b as any).rating || 0
        if (ratingB !== ratingA) return ratingB - ratingA
        return a.basePrice - b.basePrice
      })
      .slice(0, remainingSlots)
    
    return [...sameCategoryItems, ...popularItems]
  }, [allMenuItems, item])

  // FEAT-02: Use reviews from API query, fallback to item.reviews for mock mode
  const reviews = reviewsData?.reviews || item?.reviews || []
  const totalReviews = reviewsData?.totalReviews || reviews.length
  const totalReviewPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE) || 1
  const reviewStartIndex = (reviewPage - 1) * REVIEWS_PER_PAGE
  const reviewEndIndex = reviewStartIndex + REVIEWS_PER_PAGE
  const currentReviews = reviews.slice(reviewStartIndex, reviewEndIndex)
  
  // Use rating distribution from API (accurate counts), fallback to client-side calculation
  const ratingDistribution = reviewsData?.ratingDistribution || null

  // Use API average rating if available, otherwise calculate
  const averageRating = reviewsData?.averageRating 
    ? reviewsData.averageRating.toFixed(1)
    : totalReviews > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : '0.0'

  const derivedTotal = useMemo(() => {
    if (!item) return 0
    let total = item.basePrice

    // Legacy: sizes
    if (selectedSize && item.sizes) {
      const size = item.sizes.find((s) => s.size === selectedSize)
      if (size) {
        total = size.price
      }
    }

    // Legacy: toppings
    if (item.toppings) {
      selectedToppings.forEach((toppingId) => {
        const topping = item.toppings!.find((t) => t.id === toppingId)
        if (topping) {
          total += topping.price
        }
      })
    }

    // New: modifier groups
    if (item.modifierGroups) {
      item.modifierGroups.forEach(group => {
        const selected = selectedModifiers[group.id] || []
        selected.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId)
          if (option) {
            total += option.priceDelta
          }
        })
      })
    }

    return total * quantity
  }, [item, selectedSize, selectedToppings, selectedModifiers, quantity])

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    )
  }

  const toggleModifier = (groupId: string, optionId: string, maxChoices?: number) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || []
      const isSelected = current.includes(optionId)
      
      if (isSelected) {
        // Deselect
        return {
          ...prev,
          [groupId]: current.filter(id => id !== optionId)
        }
      } else {
        // Select - check maxChoices
        if (maxChoices === 1) {
          // Radio behavior - replace
          return {
            ...prev,
            [groupId]: [optionId]
          }
        } else if (maxChoices && current.length >= maxChoices) {
          // Max reached - don't add
          toast.warning(`You can only select up to ${maxChoices} options`)
          return prev
        } else {
          // Add
          return {
            ...prev,
            [groupId]: [...current, optionId]
          }
        }
      }
    })
  }

  const addToCart = () => {
    if (!item) return

    // Validate required modifier groups
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      const errors: string[] = []
      
      for (const group of item.modifierGroups) {
        const selected = selectedModifiers[group.id] || []
        
        if (group.required && selected.length === 0) {
          errors.push(`Please select ${group.name}`)
        } else if (selected.length < group.minChoices) {
          errors.push(`Please select at least ${group.minChoices} option(s) for ${group.name}`)
        } else if (group.maxChoices && selected.length > group.maxChoices) {
          errors.push(`You can only select up to ${group.maxChoices} option(s) for ${group.name}`)
        }
      }
      
      if (errors.length > 0) {
        // Show first error prominently
        toast.error(errors[0], {
          duration: 4000,
          description: errors.length > 1 ? `${errors.length - 1} more validation error(s)` : undefined
        })
        return
      }
    }

    // Convert selected modifiers to API format
    const modifiers = item.modifierGroups?.flatMap(group => 
      (selectedModifiers[group.id] || []).map(optionId => ({
        groupId: group.id,
        optionId
      }))
    )

    console.log('[DEBUG] Add to cart:', {
      menuItemId: item.id,
      quantity,
      modifiers,
      selectedModifiers,
      modifierGroups: item.modifierGroups
    })

    addItem({
      menuItemId: item.id,
      quantity,
      modifiers: modifiers && modifiers.length > 0 ? modifiers : undefined,
      notes: specialInstructions || undefined,
    })
    
    toast.success(`${item.name} added to cart!`)
    router.back()
  }

  const quickAdd = (recommendedItem: MenuItem) => {
    // Check if item has required modifiers - navigate to detail page
    if (recommendedItem.modifierGroups && recommendedItem.modifierGroups.length > 0) {
      const hasRequired = recommendedItem.modifierGroups.some(g => g.required)
      if (hasRequired) {
        toast.info(`Please select options for ${recommendedItem.name}`)
        router.push(`/menu/${recommendedItem.id}`)
        return
      }
    }
    
    // No required modifiers - can add directly
    addItem({
      menuItemId: recommendedItem.id,
      quantity: 1,
    })
    toast.success(`${recommendedItem.name} added to cart!`)
  }

  const goBack = () => {
    router.back()
  }

  const openItem = (id: string) => {
    router.push(`/menu/${id}`)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const previousReview = () => {
    setReviewPage((prev) => Math.max(1, prev - 1))
  }

  const nextReview = () => {
    setReviewPage((prev) => Math.min(totalReviewPages, prev + 1))
  }

  const toggleFullReviewList = () => {
    setShowFullReviewList((prev) => !prev)
    if (!showFullReviewList) {
      setReviewPage(1) // Reset to page 1 when opening full list
    }
  }

  const scrollToReviews = () => {
    setShowFullReviewList(true)
  }

  const state = useMemo(() => ({
    item: item || null,
    allMenuItems,
    relatedItems,
    selectedSize,
    selectedToppings,
    selectedModifiers,
    specialInstructions,
    quantity,
    reviewPage,
    isLoading,
    error: error || null,
    averageRating,
    totalReviews,
    totalReviewPages,
    currentReviews,
    allReviews: reviews,
    ratingDistribution,
    showFullReviewList,
    isBillRequested: session?.billRequestedAt != null,
  }), [
    item,
    allMenuItems,
    relatedItems,
    selectedSize,
    selectedToppings,
    selectedModifiers,
    specialInstructions,
    quantity,
    reviewPage,
    isLoading,
    error,
    averageRating,
    totalReviews,
    totalReviewPages,
    currentReviews,
    reviews,
    ratingDistribution,
    showFullReviewList,
    session?.billRequestedAt,
  ])

  return {
    state,
    derivedTotal,
    reviewsPerPage: REVIEWS_PER_PAGE,
    actions: {
      setSelectedSize,
      toggleTopping,
      toggleModifier,
      setSpecialInstructions,
      setQuantity,
      incrementQuantity,
      decrementQuantity,
      addToCart,
      quickAdd,
      goBack,
      openItem,
      previousReview,
      nextReview,
      toggleFullReviewList,
      scrollToReviews,
    },
  }
}
