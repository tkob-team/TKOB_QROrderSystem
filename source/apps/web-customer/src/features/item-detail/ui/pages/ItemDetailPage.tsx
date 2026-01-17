'use client'

import { useItemDetailController } from '../../hooks'
import { PeopleUsuallyAdd } from '../components/sections/PeopleUsuallyAdd'
import {
  ExtrasSection,
  ItemHeroSection,
  ItemInfoSection,
  ModifierGroupsSection,
  RelatedItemsSection,
  ReviewsSection,
  SizeSelectorSection,
  SpecialInstructionsSection,
  StickyActionBar,
} from '../components/sections'

interface ItemDetailProps {
  itemId: string
}

export function ItemDetailPage({ itemId }: ItemDetailProps) {
  const { state, actions, derivedTotal } = useItemDetailController(itemId)

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (state.error || !state.item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p style={{ color: 'var(--gray-900)' }} className="text-xl mb-2">Item not found</p>
          <p style={{ color: 'var(--gray-600)' }} className="mb-4">The item you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={actions.goBack}
            className="px-6 py-2 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Go back
          </button>
        </div>
      </div>    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ItemHeroSection imageUrl={state.item.imageUrl} name={state.item.name} onBack={actions.goBack} />

      <div className="flex-1 overflow-y-auto pb-24">
        <ItemInfoSection item={state.item} />

        {/* Backend modifier groups (new) */}
        {state.item.modifierGroups && state.item.modifierGroups.length > 0 && (
          <ModifierGroupsSection
            modifierGroups={state.item.modifierGroups}
            selectedModifiers={state.selectedModifiers}
            onToggle={actions.toggleModifier}
          />
        )}

        {/* Legacy: sizes (fallback for mock data) */}
        {state.item.sizes && state.item.sizes.length > 0 && !state.item.modifierGroups && (
          <SizeSelectorSection
            sizes={state.item.sizes}
            selectedSize={state.selectedSize}
            onSelectSize={actions.setSelectedSize}
          />
        )}

        {/* Legacy: toppings (fallback for mock data) */}
        {state.item.toppings && state.item.toppings.length > 0 && !state.item.modifierGroups && (
          <ExtrasSection
            toppings={state.item.toppings}
            selectedToppings={state.selectedToppings}
            onToggle={actions.toggleTopping}
          />
        )}

        <RelatedItemsSection items={state.relatedItems} onOpenItem={actions.openItem} />

        <SpecialInstructionsSection
          value={state.specialInstructions}
          onChange={actions.setSpecialInstructions}
        />

        <PeopleUsuallyAdd
          item={state.item}
          allMenuItems={state.allMenuItems}
          onAddToCart={actions.quickAdd}
        />

        <ReviewsSection
          averageRating={state.averageRating}
          totalReviews={state.totalReviews}
          currentReviews={state.currentReviews}
          reviewPage={state.reviewPage}
          totalReviewPages={state.totalReviewPages}
          onPrevious={actions.previousReview}
          onNext={actions.nextReview}
        />
      </div>

      <StickyActionBar
        quantity={state.quantity}
        onDecrement={actions.decrementQuantity}
        onIncrement={actions.incrementQuantity}
        onAddToCart={actions.addToCart}
        total={derivedTotal}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
