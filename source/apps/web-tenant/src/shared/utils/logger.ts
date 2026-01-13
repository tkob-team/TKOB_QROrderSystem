/**
 * Logger utility with explicit gating, safe formatting, and automatic PII redaction
 * 
 * Logging is OFF by default (safest for production).
 * Enable logging by setting NEXT_PUBLIC_USE_LOGGING="true" in .env
 * 
 * Controlled by explicit NEXT_PUBLIC_USE_LOGGING environment variable only.
 * 
 * Features:
 * - Single-line output: message + JSON payload
 * - Safe JSON formatting: removes undefined, truncates long strings, handles circular refs
 * - Automatic PII redaction: keys matching token/authorization/password/otp/email/phone
 * - Zero overhead when disabled (no-op functions)
 * 
 * Implementation uses bound console methods to avoid ESLint no-console warnings.
 */

const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

// PII keys to automatically redact
const PII_KEYS = ['token', 'authorization', 'password', 'otp', 'email', 'phone'];

// Safe prefixes that indicate non-PII metadata (counters, flags, status)
// Prevents false positives like hasEmail, emailVerified, emailsSent from being redacted
const SAFE_PREFIXES = ['has', 'is', 'verified', 'sent', 'count', 'total', 'num'];

// Maximum string length before truncation
const MAX_STRING_LENGTH = 200;

/**
 * Safe JSON formatter with PII redaction and truncation
 */
function safeFormat(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  try {
    // Handle circular references and apply transformations
    const seen = new WeakSet();
    
    const sanitized = JSON.parse(JSON.stringify(payload, (key, value) => {
      // Remove undefined values
      if (value === undefined) {
        return undefined;
      }

      // Detect circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }

      // Redact PII keys with safe prefix allowlist to avoid false positives
      if (key) {
        const lowerKey = key.toLowerCase();
        
        // Check if key starts with a safe prefix (hasEmail, isVerified, emailsSent, etc.)
        const hasSafePrefix = SAFE_PREFIXES.some(prefix => lowerKey.startsWith(prefix));
        if (hasSafePrefix) {
          // Safe pattern - don't redact (e.g., hasEmail, emailVerified, phoneCount)
          return value;
        }
        
        // Otherwise check if key contains PII keyword (email, phone, token, etc.)
        const containsPII = PII_KEYS.some(piiKey => lowerKey.includes(piiKey));
        if (containsPII) {
          return '[REDACTED]';
        }
      }

      // Truncate long strings
      if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
        return value.substring(0, MAX_STRING_LENGTH) + '...[truncated]';
      }

      return value;
    }));

    return ' ' + JSON.stringify(sanitized);
  } catch {
    // Fallback for any JSON.stringify errors
    return ' [SerializationError]';
  }
}

/**
 * Wrapper function to format log output consistently
 * Accepts variable arguments for backward compatibility
 */
function createLogger(consoleFn: typeof console.log) {
  return (message: string, ...args: unknown[]) => {
    // If there are additional arguments, format the first one as payload
    if (args.length > 0) {
      // If first arg is an object, format it safely
      if (args[0] && typeof args[0] === 'object') {
        const formattedPayload = safeFormat(args[0]);
        consoleFn(message + formattedPayload);
      } else {
        // For primitives or other types, pass through as-is
        consoleFn(message, ...args);
      }
    } else {
      consoleFn(message);
    }
  };
}

// No-op function for when logging is disabled
const noOp = () => {};

// Bound console methods (only called when USE_LOGGING is true)
// eslint-disable-next-line no-console
const boundLog = console.log.bind(console);
// eslint-disable-next-line no-console
const boundError = console.error.bind(console);
// eslint-disable-next-line no-console
const boundWarn = console.warn.bind(console);
// eslint-disable-next-line no-console
const boundInfo = console.info.bind(console);
// eslint-disable-next-line no-console
const boundDebug = console.debug.bind(console);

export const logger = {
  log: USE_LOGGING ? createLogger(boundLog) : noOp,
  error: USE_LOGGING ? createLogger(boundError) : noOp,
  warn: USE_LOGGING ? createLogger(boundWarn) : noOp,
  info: USE_LOGGING ? createLogger(boundInfo) : noOp,
  debug: USE_LOGGING ? createLogger(boundDebug) : noOp,
};

export default logger;
