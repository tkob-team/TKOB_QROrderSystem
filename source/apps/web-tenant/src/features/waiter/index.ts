/**
 * Waiter Feature - Service Board
 * Public API exports
 */

// UI Components
export { ServiceBoardPage } from './ui/pages/ServiceBoardPage';
export { TableGridView } from './ui/components/tables';

// Hooks (Controller only - NOT query hooks)
export { useWaiterController } from './hooks';
export type { UseWaiterControllerReturn } from './hooks';
export { useTableGridController } from './hooks/useTableGridController';

// Model (Types & Constants)
export type * from './model/types';
export type * from './model/table-types';
export * from './model/constants';
