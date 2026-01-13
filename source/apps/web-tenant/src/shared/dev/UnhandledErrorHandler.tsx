'use client';

import { useEffect } from 'react';
import { logger } from '@/shared/utils/logger';
import { toAppError, safeStringify } from '@/shared/utils/toAppError';

/**
 * Detect if an error likely originates from a browser extension
 * @param filename - Error filename or URL
 * @param stack - Error stack trace
 * @returns Object with detection result and reasoning
 */
function detectExtensionNoise(filename?: string, stack?: string): { isLikelyExtensionNoise: boolean; reason?: string } {
  if (!filename && !stack) {
    return { isLikelyExtensionNoise: false };
  }

  // Check for chrome-extension:// URLs
  if (filename?.includes('chrome-extension://')) {
    return { isLikelyExtensionNoise: true, reason: 'chrome-extension:// URL in filename' };
  }

  // Check for content-script.js in stack
  if (stack?.includes('content-script.js') || stack?.includes('contentScript.js')) {
    return { isLikelyExtensionNoise: true, reason: 'content-script.js in stack trace' };
  }

  // Check for onboarding.js pattern (known injected script)
  if (filename?.includes('onboarding.js') || stack?.includes('onboarding.js')) {
    return { isLikelyExtensionNoise: true, reason: 'onboarding.js detected (likely extension)' };
  }

  // Check for moz-extension:// URLs (Firefox extensions)
  if (filename?.includes('moz-extension://')) {
    return { isLikelyExtensionNoise: true, reason: 'moz-extension:// URL in filename' };
  }

  // Check for safari-extension:// URLs (Safari extensions)
  if (filename?.includes('safari-extension://')) {
    return { isLikelyExtensionNoise: true, reason: 'safari-extension:// URL in filename' };
  }

  // Check for common extension patterns in stack
  const extensionPatterns = ['chrome-extension://', 'moz-extension://', 'safari-extension://', 'vscode-webview://'];
  if (extensionPatterns.some(pattern => stack?.includes(pattern))) {
    return { isLikelyExtensionNoise: true, reason: 'Extension URL pattern detected in stack' };
  }

  return { isLikelyExtensionNoise: false };
}

/**
 * Global Unhandled Error Handler (DEV-ONLY)
 * 
 * Captures and logs unhandled promise rejections and errors.
 * Distinguishes between app errors and browser extension noise.
 * 
 * Only active when NEXT_PUBLIC_USE_LOGGING is enabled.
 * Never suppresses real app errors (only logs, never calls preventDefault for app errors).
 * 
 * Logs:
 * - Error message, name, stack (first 5 lines)
 * - Source filename and line/column numbers
 * - Extension noise detection flag and reasoning
 * - NO raw payloads or PII
 */
export function UnhandledErrorHandler() {
  useEffect(() => {
    const useLogging = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';
    
    if (!useLogging) {
      return; // Only attach handlers if logging is enabled (dev mode)
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const appError = toAppError(reason, 'unhandledrejection');
      const stack = appError.stack;

      // Detect if this is likely extension noise
      const { isLikelyExtensionNoise, reason: detectionReason } = detectExtensionNoise(undefined, stack);
      
      // Log the unhandled rejection safely
      const errorInfo = {
        type: 'unhandledrejection',
        message: appError.message,
        name: appError.name,
        code: (appError as any).code,
        context: (appError as any).context,
        stack: stack?.split('\n').slice(0, 5).join('\n'),
        source: {
          isLikelyExtensionNoise,
          detectionReason: isLikelyExtensionNoise ? detectionReason : undefined,
        },
      };

      logger.error('[global] UNHANDLED_REJECTION', errorInfo);
      
      // Only prevent default for known extension noise
      // Real app errors should still appear in console for debugging
      if (isLikelyExtensionNoise) {
        event.preventDefault();
        logger.info('[global] EXTENSION_NOISE_SUPPRESSED', {
          reason: detectionReason,
          originalMessage: appError.message,
        });
      }
    };

    // Handle global errors (including sync errors and errors from event handlers)
    const handleError = (event: ErrorEvent) => {
      const appError = toAppError(event.error, 'uncaught-error');
      const filename = event.filename || '(no filename)';
      const stack = appError.stack;

      // Detect if this is likely extension noise
      const { isLikelyExtensionNoise, reason: detectionReason } = detectExtensionNoise(filename, stack);
      
      const errorInfo = {
        type: 'error',
        message: appError.message,
        name: appError.name,
        source: {
          filename,
          lineno: event.lineno,
          colno: event.colno,
          isLikelyExtensionNoise,
          detectionReason: isLikelyExtensionNoise ? detectionReason : undefined,
        },
        stack: stack?.split('\n').slice(0, 5).join('\n'),
      };

      logger.error('[global] UNCAUGHT_ERROR', errorInfo);
      
      // Only suppress console output for known extension noise
      // Real app errors should be visible
      if (isLikelyExtensionNoise) {
        logger.info('[global] EXTENSION_NOISE_SUPPRESSED', {
          reason: detectionReason,
          filename,
          originalMessage: appError.message,
        });
        // Return true to prevent default error handling for extension noise
        return true;
      }

      // Return false to allow default handling for real errors
      return false;
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}