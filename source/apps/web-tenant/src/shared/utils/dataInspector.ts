/**
 * Data Inspector Utility
 * Safe data shape inspection for debugging (PII-free, truncated)
 * 
 * Purpose:
 * - Enable data-level debugging without exposing sensitive information
 * - Log structure (keys, types, counts) NOT raw values
 * - Gated by NEXT_PUBLIC_LOG_DATA === "true" at call sites
 * 
 * Safety Guarantees:
 * - No raw payload values returned (only metadata)
 * - Whitelisted request params only (safe enum values)
 * - Truncated output (max 8 keys, max 500 char strings)
 * - No PII fields logged (email, phone, password, customerName, etc.)
 * 
 * @module dataInspector
 */

/**
 * Shape summary metadata for response data inspection
 */
export type ShapeSummary = {
  /** Whether the data is an array */
  isArray: boolean;
  /** Number of items in array (if isArray=true) */
  count?: number;
  /** Sample of top-level keys (max 8, truncated) */
  sampleKeys?: string[];
  /** Whether response has pagination metadata (next/hasNext keys) */
  hasNext?: boolean;
  /** Whether data is null/undefined/empty object/empty array */
  isEmpty?: boolean;
};

/**
 * Maximum number of keys to include in sampleKeys (truncation safeguard)
 */
const MAX_SAMPLE_KEYS = 8;

/**
 * Maximum length for any stringified output (truncation safeguard)
 */
const MAX_STRING_LENGTH = 500;

/**
 * Maximum length for string values in full payload logging
 */
const MAX_VALUE_STRING_LENGTH = 200;

/**
 * Maximum number of items to keep when sampling arrays for payload logging
 */
const MAX_ARRAY_SAMPLE = 2;

/**
 * Sensitive key patterns for deep redaction (case-insensitive)
 */
const REDACT_PATTERNS = [
  'token',
  'authorization',
  'password',
  'otp',
  'email',
  'phone',
  'name',
  'address',
];

/**
 * Keys that must always be redacted even if present in allowKeys.
 */
const FORCE_REDACT_KEYS = ['fullname', 'displayname', 'username'];

/**
 * Inspect response data shape without exposing raw values.
 * Returns metadata about data structure (array vs object, count, keys).
 * 
 * @param data - Response data from API (unknown type for safety)
 * @returns ShapeSummary with metadata only (no raw values)
 * 
 * @example
 * // Array response
 * inspectResponseShape([{ id: 1, name: "Item" }])
 * // → { isArray: true, count: 1, sampleKeys: ["id", "name"], isEmpty: false }
 * 
 * @example
 * // Object response
 * inspectResponseShape({ id: 1, status: "ok", data: [...] })
 * // → { isArray: false, sampleKeys: ["id", "status", "data"], hasNext: false, isEmpty: false }
 * 
 * @example
 * // Empty response
 * inspectResponseShape(null)
 * // → { isArray: false, isEmpty: true }
 */
export function inspectResponseShape(data: unknown): ShapeSummary {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return { isArray: false, isEmpty: true };
  }

  // Handle paginated response structure: { data: [...], meta: {...} }
  if (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as Record<string, unknown>).data)
  ) {
    const paginatedData = data as Record<string, unknown>;
    const dataArray = paginatedData.data as unknown[];
    
    // Get sample keys from first item (if exists)
    const sampleKeys =
      dataArray.length > 0 && typeof dataArray[0] === 'object' && dataArray[0] !== null
        ? Object.keys(dataArray[0]).slice(0, MAX_SAMPLE_KEYS)
        : [];

    return {
      isArray: true,
      count: dataArray.length,
      sampleKeys,
      isEmpty: dataArray.length === 0,
    };
  }

  // Handle arrays
  if (Array.isArray(data)) {
    // Get sample keys from first item (if exists)
    const sampleKeys =
      data.length > 0 && typeof data[0] === 'object' && data[0] !== null
        ? Object.keys(data[0]).slice(0, MAX_SAMPLE_KEYS)
        : [];

    return {
      isArray: true,
      count: data.length,
      sampleKeys,
      isEmpty: data.length === 0,
    };
  }

  // Handle objects
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);

    return {
      isArray: false,
      sampleKeys: keys.slice(0, MAX_SAMPLE_KEYS),
      hasNext: 'next' in obj || 'hasNext' in obj || 'nextCursor' in obj,
      isEmpty: keys.length === 0,
    };
  }

  // Handle primitives (string, number, boolean)
  // This shouldn't happen for API responses, but handle gracefully
  return { isArray: false, isEmpty: false };
}

/**
 * Whitelist of safe request parameter keys that can be logged.
 * These are non-PII enum values and pagination/sorting metadata.
 * 
 * NEVER add to this list:
 * - email, phone, name, address, dob (PII)
 * - password, token, secret, apiKey (auth)
 * - cardNumber, cvv, accountNumber (payment)
 * - customerId, userId with value (could expose sensitive data)
 */
const SAFE_PARAM_KEYS = [
  // Filtering
  'categoryId',
  'status',
  'location',
  'type',
  'role',
  'available',
  'active',
  // Sorting
  'sortBy',
  'sortOrder',
  // Pagination
  'page',
  'limit',
  'offset',
  'cursor',
  // Date ranges (no specific dates, only range type)
  'range',
  'period',
] as const;

/**
 * Inspect request params and return only whitelisted keys.
 * Filters out any PII or sensitive data from request parameters.
 * 
 * @param params - Request query params or body params
 * @returns Whitelisted params only, or null if no safe params found
 * 
 * @example
 * // Safe params extracted
 * inspectRequestParams({ categoryId: '5', status: 'PUBLISHED', email: 'user@example.com' })
 * // → { categoryId: '5', status: 'PUBLISHED' }
 * // Note: email filtered out (PII)
 * 
 * @example
 * // No safe params
 * inspectRequestParams({ email: 'user@example.com', phone: '1234567890' })
 * // → null (all params filtered)
 * 
 * @example
 * // Null input
 * inspectRequestParams(null)
 * // → null
 */
export function inspectRequestParams(
  params?: Record<string, unknown> | null
): Record<string, unknown> | null {
  // Handle null/undefined/non-object
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return null;
  }

  const safeParams: Record<string, unknown> = {};

  // Extract only whitelisted keys
  for (const key of SAFE_PARAM_KEYS) {
    if (key in params) {
      safeParams[key] = params[key];
    }
  }

  // Return null if no safe params found (avoid logging empty objects)
  return Object.keys(safeParams).length > 0 ? safeParams : null;
}

/**
 * Compare before/after objects and return type changes for specified keys.
 * Used to verify data transformations in mappers (DTO → ViewModel).
 * 
 * @param before - Object before transformation (e.g., DTO from API)
 * @param after - Object after transformation (e.g., ViewModel for UI)
 * @param keys - Array of keys to check for type changes
 * @returns Record of key → "beforeType → afterType" for changed types only
 * 
 * @example
 * // Type changes detected
 * const dto = { id: 1, price: "12.99", status: "PUBLISHED" };
 * const vm = { id: "1", price: 12.99, status: "PUBLISHED" };
 * getTypeChanges(dto, vm, ["id", "price", "status"])
 * // → { id: "number → string", price: "string → number" }
 * // Note: status not included (same type)
 * 
 * @example
 * // No type changes
 * getTypeChanges({ id: 1 }, { id: 2 }, ["id"])
 * // → {} (both number, value change not logged)
 * 
 * @example
 * // Missing keys handled gracefully
 * getTypeChanges({ id: 1 }, { name: "test" }, ["id", "name"])
 * // → {} (id missing in after, name missing in before)
 */
export function getTypeChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  keys: string[]
): Record<string, string> {
  const changes: Record<string, string> = {};

  for (const key of keys) {
    // Only compare if key exists in both objects
    if (key in before && key in after) {
      const beforeType = typeof before[key];
      const afterType = typeof after[key];

      // Only log if type actually changed
      if (beforeType !== afterType) {
        changes[key] = `${beforeType} → ${afterType}`;
      }
    }
  }

  return changes;
}

/**
 * Truncate a string to max length with ellipsis indicator.
 * Safety utility to prevent massive log outputs.
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: MAX_STRING_LENGTH)
 * @returns Truncated string with "..." if exceeded, original if within limit
 * 
 * @example
 * truncateString("short", 500)
 * // → "short"
 * 
 * @example
 * truncateString("a".repeat(600), 500)
 * // → "aaa...aaa" (500 chars total with ellipsis)
 */
export function truncateString(str: string, maxLength: number = MAX_STRING_LENGTH): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Determine if a key should be redacted based on sensitive patterns
 */
function shouldRedactKey(key: string, allowKeys?: Set<string>): boolean {
  const lower = key.toLowerCase();

  if (lower.endsWith('url')) {
    return false; // URLs are allowed (still truncated downstream if long)
  }

  if (allowKeys && allowKeys.has(lower) && !FORCE_REDACT_KEYS.includes(lower)) {
    return false;
  }

  return REDACT_PATTERNS.some(pattern => lower.includes(pattern));
}

type RedactOptions = {
  stringLimit?: number;
  allowKeys?: string[];
};

/**
 * Deeply redact and truncate payloads for opt-in full payload logging.
 * - Redacts sensitive keys (token, password, email, phone, name, address, authorization, otp)
 * - Truncates strings to 200 chars
 * - Samples arrays to first 2 items + tail marker
 * - Preserves object keys, with redacted/truncated values
 * - Guards against circular references
 */
export function redactAndTruncateDeep(
  value: unknown,
  options: RedactOptions = {},
  seen = new WeakSet()
): unknown {
  const stringLimit = options.stringLimit ?? MAX_VALUE_STRING_LENGTH;
  const allowKeysSet = options.allowKeys ? new Set(options.allowKeys.map(k => k.toLowerCase())) : undefined;

  // Primitives
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return truncateString(value, stringLimit);
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  // Array
  if (Array.isArray(value)) {
    const sample = value.slice(0, MAX_ARRAY_SAMPLE).map(item => redactAndTruncateDeep(item, options, seen));
    if (value.length > MAX_ARRAY_SAMPLE) {
      sample.push(`...(${value.length - MAX_ARRAY_SAMPLE} more)`);
    }
    return sample;
  }

  // Object
  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      return '[Circular]';
    }
    seen.add(value as object);

    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (shouldRedactKey(k, allowKeysSet)) {
        result[k] = '***';
        continue;
      }
      result[k] = redactAndTruncateDeep(v, options, seen);
    }
    return result;
  }

  // Fallback for unsupported types
  try {
    return truncateString(String(value), stringLimit);
  } catch {
    return '[Unserializable]';
  }
}

/**
 * Sample payload for full logging (still redacted/truncated).
 * Arrays: first 2 items (+ tail marker) after redaction
 * Objects: fully redacted/truncated copy
 * Primitives: redacted/truncated value
 */
export function samplePayload(data: unknown, options: RedactOptions = {}): unknown {
  return redactAndTruncateDeep(data, options);
}
