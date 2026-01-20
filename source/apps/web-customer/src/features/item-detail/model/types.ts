import type { MenuItem, Review } from '@/types'

export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export interface ItemDetailState {
  item: MenuItem | null
  allMenuItems: MenuItem[]
  relatedItems: MenuItem[]
  selectedSize: string
  selectedToppings: string[]
  selectedModifiers: Record<string, string[]>
  specialInstructions: string
  quantity: number
  reviewPage: number
  isLoading: boolean
  error: unknown | null
  averageRating: string
  totalReviews: number
  totalReviewPages: number
  currentReviews: Review[]
  allReviews: Review[]
  ratingDistribution: RatingDistribution | Record<number, number> | null
  showFullReviewList: boolean
  isBillRequested: boolean
}

export interface ItemDetailActions {
  setSelectedSize: (size: string) => void
  toggleTopping: (toppingId: string) => void
  toggleModifier: (groupId: string, optionId: string, maxChoices?: number) => void
  setSpecialInstructions: (value: string) => void
  setQuantity: (qty: number) => void
  incrementQuantity: () => void
  decrementQuantity: () => void
  addToCart: () => void
  quickAdd: (item: MenuItem) => void
  goBack: () => void
  openItem: (id: string) => void
  previousReview: () => void
  nextReview: () => void
  toggleFullReviewList: () => void
  scrollToReviews: () => void
}

export interface ItemDetailController {
  state: ItemDetailState
  actions: ItemDetailActions
  derivedTotal: number
  reviewsPerPage: number
}
