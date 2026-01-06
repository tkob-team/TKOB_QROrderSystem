/**
 * Application Configuration
 * Centralized config for environment variables
 * 
 * @deprecated Use `env` from './env' for direct environment access
 * This file is kept for backward compatibility
 */

import { env } from './env';

export const config = {
  /**
   * API Configuration
   */
  apiUrl: env.apiUrl,
  wsUrl: env.wsUrl,

  /**
   * Mock Data Configuration
   * Set to true to use mock data instead of real API calls
   */
  useMockData: env.useMock,

  /**
   * App Configuration
   */
  appName: env.appName,

  /**
   * Feature Flags
   */
  features: {
    enableAnalytics: env.enableAnalytics,
    enableNotifications: env.enableNotifications,
  },
} as const;

export default config;
