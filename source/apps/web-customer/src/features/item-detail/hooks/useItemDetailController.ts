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

    if (selectedSize && item.sizes) {
      const size = item.sizes.find((s) => s.size === selectedSize)
      if (size) {
        total = size.price
      }
    }

    if (item.toppings) {
      selectedToppings.forEach((toppingId) => {
        const topping = item.toppings!.find((t) => t.id === toppingId)
        if (topping) {
          total += topping.price
        }
      })
    }

    return total * quantity
  }, [item, selectedSize, selectedToppings, quantity])

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    )
  }

  const addToCart = () => {
    if (!item) return

    addItem({
      menuItem: item,
      selectedSize: selectedSize || undefined,
      selectedToppings,
      specialInstructions,
      quantity,
    })
    toast.success(`${item.name} added to cart!`)
    router.back()
  }

  const quickAdd = (recommendedItem: MenuItem) => {
    addItem({
      menuItem: recommendedItem,
      selectedSize: recommendedItem.sizes ? recommendedItem.sizes[0].size : undefined,
      selectedToppings: [],
      specialInstructions: '',
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
