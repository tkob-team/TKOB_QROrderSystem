/**
 * Waiter Feature - Service Board
 * Public API exports
 */

// UI Components
export { ServiceBoardPage } from './ui/pages/ServiceBoardPage';

// Hooks (Controller only - NOT query hooks)
export { useWaiterController } from './hooks';
export type { UseWaiterControllerReturn } from './hooks';

// Model (Types & Constants)
export type * from './model/types';
export * from './model/constants';
