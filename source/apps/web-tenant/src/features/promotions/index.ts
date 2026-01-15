/**
 * Promotions Feature - Public Exports
 */

// UI Components
export { PromotionsPage } from './ui/PromotionsPage';
export { CreatePromotionModal } from './ui/CreatePromotionModal';

// Hooks
export {
  usePromotions,
  usePromotion,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotionActive,
} from './hooks/usePromotions';

// Types
export type * from './model/types';
export { formatDiscount, isPromoValid } from './model/types';
