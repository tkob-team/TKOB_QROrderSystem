/**
 * Menu Data Layer - Public Entry Point
 * 
 * Exports:
 * - IMenuAdapter: Canonical interface for menu data operations
 * - menuAdapter: Singleton instance (mock or real API)
 * 
 * NOTE: This is the ONLY entry point for accessing menu data.
 * Do NOT import directly from factory.ts, api/, or mocks/
 */

export { menuAdapter } from './factory';
export type { IMenuAdapter, IMenuCategoriesAdapter, IMenuItemsAdapter, IModifiersAdapter, IMenuPhotosAdapter } from './adapter.interface';
