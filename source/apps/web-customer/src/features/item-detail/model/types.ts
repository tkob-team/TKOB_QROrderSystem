import type { MenuItem, Review } from '@/types'

export interface ItemDetailState {
  item: MenuItem | null
  allMenuItems: MenuItem[]
  relatedItems: MenuItem[]
  selectedSize: string
  selectedToppings: string[]
  specialInstructions: string
  quantity: number
  reviewPage: number
  isLoading: boolean
  error: unknown | null
  averageRating: string
  totalReviews: number
  totalReviewPages: number
  currentReviews: Review[]
}

export interface ItemDetailActions {
  setSelectedSize: (size: string) => void
  toggleTopping: (toppingId: string) => void
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
}

export interface ItemDetailController {
  state: ItemDetailState
  actions: ItemDetailActions
  derivedTotal: number
  reviewsPerPage: number
}
