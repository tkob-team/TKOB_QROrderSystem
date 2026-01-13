/**
 * Logging utility helpers
 * 
 * Shared functions for PII masking and data formatting in logs
 */

/**
 * Mask an ID to show only last 4 characters
 * 
 * @param id - The ID to mask
 * @returns Masked ID like `***abc123` or original if <= 4 chars
 * 
 * @example
 * maskId('long-order-id-12345') // => '***12345'
 * maskId('abc') // => 'abc'
 */
export function maskId(id: string): string {
  if (!id || id.length <= 4) return id;
  return `***${id.slice(-4)}`;
}

/**
 * Optionally mask an ID (handles null/undefined)
 * 
 * @param id - The ID to mask, or null/undefined
 * @returns Masked ID, undefined for null/undefined input
 * 
 * @example
 * maskMaybe('long-order-id-12345') // => '***12345'
 * maskMaybe(null) // => undefined
 */
export function maskMaybe(id?: string | null): string | undefined {
  if (!id) return undefined;
  return maskId(id);
}
