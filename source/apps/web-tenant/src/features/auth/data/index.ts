/**
 * Auth Data Layer - Public API
 * Only export factory and types (NOT concrete adapters)
 */

export type { IAuthAdapter } from './adapter.interface';
export { getAuthAdapter } from './factory';
