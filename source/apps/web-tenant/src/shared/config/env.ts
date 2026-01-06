/**
 * Typed Environment Configuration
 * Single source of truth for all env vars
 * 
 * This module provides type-safe access to environment variables with validation.
 * All environment variables should be accessed through this module to ensure consistency.
 */

// 1. Define env schema from process.env
const envSchema = {
  // API Configuration
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  
  // Feature Flags
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
  
  // App Configuration
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
} as const;

// 2. Validation (dev-time warnings)
function validateEnv() {
  // Only validate on server side during build/dev
  if (typeof window === 'undefined') {
    const missing: string[] = [];
    
    // Check for required vars (add more as needed)
    if (!envSchema.NEXT_PUBLIC_API_URL) {
      missing.push('NEXT_PUBLIC_API_URL');
    }
    
    if (missing.length > 0 && envSchema.NODE_ENV === 'development') {
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      console.warn(`   Using default values. Check your .env file.`);
    }
  }
}

// Run validation
validateEnv();

// 3. Export typed, parsed config
export const env = {
  // API
  apiUrl: envSchema.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  wsUrl: envSchema.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  
  // Feature Flags (parsed to boolean)
  useMock: envSchema.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  enableAnalytics: envSchema.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableNotifications: envSchema.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  
  // App
  appName: envSchema.NEXT_PUBLIC_APP_NAME || 'TKOB Admin',
  
  // Environment
  isDev: envSchema.NODE_ENV === 'development',
  isProd: envSchema.NODE_ENV === 'production',
  isTest: envSchema.NODE_ENV === 'test',
} as const;

// Debug log
console.log('[ENV] NEXT_PUBLIC_USE_MOCK_DATA:', envSchema.NEXT_PUBLIC_USE_MOCK_DATA);
console.log('[ENV] useMock:', env.useMock);

// Type exports for consumers
export type Env = typeof env;
