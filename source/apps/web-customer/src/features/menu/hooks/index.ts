/**
 * Menu feature hooks
 * 
 * Public API:
 * - useMenu(tenantId) - fetch public menu (session-based)
 * - useMenuItem(itemId) - fetch single menu item by ID
 */

export { useMenu, useMenuItem } from './queries/useMenu';
