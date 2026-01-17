"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { MenuItem } from '@/types'
import { useCart } from '@/shared/hooks/useCart'
import { useSession } from '@/features/tables/hooks'
import { useItemDetailQuery, useMenuItemsQuery } from './queries/useItemDetailQueries'
import type { ItemDetailController } from '../model'

const REVIEWS_PER_PAGE = 3

export function useItemDetailController(itemId: string): ItemDetailController {
  const router = useRouter()
  const { addItem } = useCart()
  const { session } = useSession()
  const tenantId = session?.tenantId

  const { data: item, isLoading, error } = useItemDetailQuery(itemId)
  const { data: allMenuItems = [] } = useMenuItemsQuery(tenantId)

  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({}) // groupId -> optionIds[]
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviewPage, setReviewPage] = useState(1)

  // Initialize selected size when item loads
  useEffect(() => {
    if (item && !selectedSize && item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0].size)
    }
  }, [item, selectedSize])

  // Reset review page when item changes
  useEffect(() => {
    setReviewPage(1)
  }, [item])

  const relatedItems = useMemo(() => {
    if (!item) return [] as MenuItem[]
    return allMenuItems
      .filter((menuItem) =>
        menuItem.id !== item.id &&
        menuItem.category === item.category &&
        (menuItem.availability === 'Available' || !menuItem.availability)
      )
      .slice(0, 4)
  }, [allMenuItems, item])

  const reviews = item?.reviews || []
  const totalReviews = reviews.length
  const totalReviewPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE) || 1
  const reviewStartIndex = (reviewPage - 1) * REVIEWS_PER_PAGE
  const reviewEndIndex = reviewStartIndex + REVIEWS_PER_PAGE
  const currentReviews = reviews.slice(reviewStartIndex, reviewEndIndex)

  const averageRating = totalReviews > 0
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
    },
  }
}
