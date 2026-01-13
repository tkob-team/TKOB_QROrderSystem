/**
 * Menu feature data layer
 * 
 * Public API:
 * - MenuDataFactory - selector for mock vs real adapters
 * - IMenuAdapter - interface for adapter implementations
 * - IMenuStrategy - legacy interface (backward compatibility)
 * 
 * This layer encapsulates all menu data access logic.
 * Features should import from here, not from global @/api.
 */

export { MenuDataFactory } from './factory';
export type { IMenuAdapter } from './adapter.interface';
export type { IMenuStrategy } from './types';
export { MockMenuAdapter } from './mocks/menu.adapter';
export { MenuAdapter } from './api/menu.adapter';
