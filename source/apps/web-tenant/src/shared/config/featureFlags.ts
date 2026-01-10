import { env } from './env';

/**
 * Feature Flags
 * Centralized feature toggles for the application
 * 
 * This module provides a single source of truth for all feature flags.
 * Features can be toggled globally or per-module.
 */

export const featureFlags = {
  // Global mock data toggle
  useMockData: env.useMock,
  
  // Application features
  analytics: env.enableAnalytics,
  notifications: env.enableNotifications,
  
  // Per-feature mock toggles (can override global setting if needed)
  mock: {
    orders: env.useMock,
    tables: env.useMock,
    menu: env.useMock,
    auth: env.useMock,
    kds: env.useMock,
    waiter: env.useMock,
    analytics: env.useMock,
    dashboard: env.useMock,
    staff: env.useMock,
    settings: env.useMock,
  },
} as const;

export type FeatureFlags = typeof featureFlags;

/**
 * Helper function to check if mock data is enabled for a specific feature
 * @param feature - The feature name to check
 * @returns true if mock data should be used for this feature
 */
export function isMockEnabled(feature: keyof typeof featureFlags.mock): boolean {
  return featureFlags.mock[feature];
}

/**
 * Helper function to check if a feature is enabled
 * @param feature - The feature name to check
 * @returns true if the feature is enabled
 */
export function isFeatureEnabled(feature: keyof Omit<typeof featureFlags, 'mock' | 'useMockData'>): boolean {
  return featureFlags[feature];
}
