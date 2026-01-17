/**
 * Currency utility functions
 * 
 * System convention:
 * - All prices in database are stored in USD
 * - Convert to VND when needed for payment/display
 */

/**
 * Exchange rate USD to VND
 * Update this value periodically or fetch from API
 */
export const USD_TO_VND_RATE = 25000;

/**
 * Convert USD cents to VND
 * @param usdCents - Amount in USD cents (e.g., 1295 = $12.95)
 * @returns Amount in VND (rounded to nearest dong)
 * 
 * @example
 * convertUsdToVnd(1295) // Returns 323750 (12.95 * 25000)
 */
export function convertUsdToVnd(usdCents: number): number {
  const usdDollars = usdCents / 100;
  const vnd = usdDollars * USD_TO_VND_RATE;
  return Math.round(vnd);
}

/**
 * Convert VND to USD cents
 * @param vnd - Amount in VND
 * @returns Amount in USD cents
 * 
 * @example
 * convertVndToUsd(323750) // Returns 1295 (323750 / 25000 * 100)
 */
export function convertVndToUsd(vnd: number): number {
  const usdDollars = vnd / USD_TO_VND_RATE;
  const usdCents = usdDollars * 100;
  return Math.round(usdCents);
}

/**
 * Format USD cents to display string
 * @param usdCents - Amount in USD cents
 * @returns Formatted string (e.g., "$12.95")
 */
export function formatUsd(usdCents: number): string {
  const dollars = usdCents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format VND to display string
 * @param vnd - Amount in VND
 * @returns Formatted string (e.g., "323,750đ")
 */
export function formatVnd(vnd: number): string {
  return `${vnd.toLocaleString('vi-VN')}đ`;
}
