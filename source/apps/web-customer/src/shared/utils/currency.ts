/**
 * Currency utility functions for customer app
 * 
 * System convention (UPDATED):
 * - All prices from API are in USD DOLLARS (not cents)
 * - Database stores Decimal(10,2) as dollars with 2 decimal places
 * - Display in USD for international customers
 * - Convert to VND only for SePay payment method
 * 
 * @example
 * // Display prices
 * formatUSD(12.95) // "$12.95"
 * formatUSD(150) // "$150.00"
 * 
 * // Payment conversion
 * const vnd = convertUSDToVND(12.95) // 323750 VND
 * formatVND(vnd) // "323,750 VND"
 */

/**
 * Exchange rate USD to VND
 * Should match backend rate or be fetched from API
 * @default 25000 (1 USD = 25,000 VND)
 */
export const USD_TO_VND_RATE = 25000;

// ============================================================================
// USD FORMATTING (PRIMARY)
// ============================================================================

/**
 * Format USD dollars to display string
 * This is the PRIMARY display format for all prices in the app
 * 
 * @param usdDollars - Amount in USD dollars (e.g., 12.95)
 * @returns Formatted USD string with $ symbol (e.g., "$12.95")
 * 
 * @example
 * formatUSD(12.95) // "$12.95"
 * formatUSD(100) // "$100.00"
 * formatUSD(0.99) // "$0.99"
 * formatUSD(0) // "$0.00"
 */
export function formatUSD(usdDollars: number): string {
  return `$${usdDollars.toFixed(2)}`;
}

/**
 * Format USD dollars (not cents) to display string
 * Use this when working with dollar amounts instead of cents
 * 
 * @param usdDollars - Amount in USD dollars (e.g., 12.95)
 * @returns Formatted USD string with $ symbol (e.g., "$12.95")
 * 
 * @example
 * formatUSDFromDollars(12.95) // "$12.95"
 * formatUSDFromDollars(100) // "$100.00"
 */
export function formatUSDFromDollars(usdDollars: number): string {
  return `$${usdDollars.toFixed(2)}`;
}

/**
 * Parse USD string to cents (for legacy compatibility)
 * Extracts numeric value from USD string and converts to cents
 * 
 * @param usdString - USD string (e.g., "$12.95" or "12.95")
 * @returns Amount in USD cents, or 0 if invalid
 * 
 * @example
 * parseUSDToCents("$12.95") // 1295
 * parseUSDToCents("12.95") // 1295
 * parseUSDToCents("$100") // 10000
 * parseUSDToCents("invalid") // 0
 */
export function parseUSDToCents(usdString: string): number {
  // Remove $ symbol and any whitespace
  const cleanString = usdString.replace(/[$\s]/g, '');
  const dollars = parseFloat(cleanString);
  
  if (isNaN(dollars)) {
    return 0;
  }
  
  return Math.round(dollars * 100);
}

/**
 * Parse USD string to dollars
 * Extracts numeric value from USD string
 * 
 * @param usdString - USD string (e.g., "$12.95" or "12.95")
 * @returns Amount in USD dollars, or 0 if invalid
 * 
 * @example
 * parseUSDToDollars("$12.95") // 12.95
 * parseUSDToDollars("12.95") // 12.95
 * parseUSDToDollars("$100") // 100
 */
export function parseUSDToDollars(usdString: string): number {
  const cleanString = usdString.replace(/[$\s]/g, '');
  const dollars = parseFloat(cleanString);
  return isNaN(dollars) ? 0 : dollars;
}

// ============================================================================
// VND CONVERSION (SECONDARY - For SePay Payment Only)
// ============================================================================

/**
 * Convert USD dollars to VND
 * Use this ONLY for SePay payment conversion
 * 
 * @param usdDollars - Amount in USD dollars (e.g., 12.95)
 * @param exchangeRate - Exchange rate (default: USD_TO_VND_RATE)
 * @returns Amount in VND (rounded to nearest dong)
 * 
 * @example
 * convertUSDToVND(12.95) // 323750
 * convertUSDToVND(12.95, 24000) // 310800
 */
export function convertUSDToVND(
  usdDollars: number,
  exchangeRate: number = USD_TO_VND_RATE
): number {
  const vnd = usdDollars * exchangeRate;
  return Math.round(vnd);
}

/**
 * @deprecated Use convertUSDToVND instead
 * Convert USD cents to VND (legacy compatibility)
 */
export function convertUSDCentsToVND(
  usdCents: number,
  exchangeRate: number = USD_TO_VND_RATE
): number {
  const usdDollars = usdCents / 100;
  const vnd = usdDollars * exchangeRate;
  return Math.round(vnd);
}

/**
 * Format VND amount to display string
 * Use this ONLY when showing VND conversion for SePay
 * 
 * @param vndAmount - Amount in VND
 * @returns Formatted VND string (e.g., "323,750 VND")
 * 
 * @example
 * formatVND(323750) // "323,750 VND"
 * formatVND(1000000) // "1,000,000 VND"
 */
export function formatVND(vndAmount: number): string {
  return `${vndAmount.toLocaleString('en-US')} VND`;
}

/**
 * Format VND amount with đ symbol (alternative format)
 * Use this for compact display
 * 
 * @param vndAmount - Amount in VND
 * @returns Formatted VND string (e.g., "323,750đ")
 * 
 * @example
 * formatVNDWithSymbol(323750) // "323,750đ"
 */
export function formatVNDWithSymbol(vndAmount: number): string {
  return `${vndAmount.toLocaleString('en-US')}đ`;
}

/**
 * Format USD with VND conversion for payment display
 * Shows both currencies with conversion note
 * 
 * @param usdDollars - Amount in USD dollars (e.g., 12.95)
 * @param exchangeRate - Exchange rate (default: USD_TO_VND_RATE)
 * @returns Object with USD, VND, and display strings
 * 
 * @example
 * const payment = formatPaymentAmount(12.95);
 * // {
 * //   usd: "$12.95",
 * //   vnd: "323,750 VND",
 * //   display: "$12.95 (≈ 323,750 VND)",
 * //   usdDollars: 12.95,
 * //   vndAmount: 323750
 * // }
 */
export function formatPaymentAmount(
  usdDollars: number,
  exchangeRate: number = USD_TO_VND_RATE
): {
  usd: string;
  vnd: string;
  display: string;
  usdDollars: number;
  vndAmount: number;
  exchangeRate: number;
} {
  const vndAmount = convertUSDToVND(usdDollars, exchangeRate);
  const usd = formatUSD(usdDollars);
  const vnd = formatVND(vndAmount);
  
  return {
    usd,
    vnd,
    display: `${usd} (≈ ${vnd})`,
    usdDollars,
    vndAmount,
    exchangeRate,
  };
}

// ============================================================================
// LEGACY SUPPORT (Deprecated - Use USD versions)
// ============================================================================

/**
 * @deprecated Use formatUSD instead
 * Legacy function for backward compatibility
 */
export function formatVnd(usdDollars: number): string {
  console.warn('formatVnd is deprecated. Use formatUSD instead.');
  return formatUSD(usdDollars);
}

/**
 * @deprecated Use convertUSDToVND instead
 * Legacy function for backward compatibility
 */
export function convertUsdToVnd(usdDollars: number): number {
  console.warn('convertUsdToVnd is deprecated. Use convertUSDToVND instead.');
  return convertUSDToVND(usdDollars);
}

/**
 * @deprecated Use formatUSD instead
 * Legacy function for backward compatibility
 */
export function formatUsd(usdDollars: number): string {
  console.warn('formatUsd is deprecated. Use formatUSD instead.');
  return formatUSD(usdDollars);
}

/**
 * @deprecated VND short format no longer used
 * Legacy function for backward compatibility
 */
export function formatVndShort(usdDollars: number): string {
  console.warn('formatVndShort is deprecated. Use formatUSD instead.');
  return formatUSD(usdDollars);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export interface PaymentAmountFormatted {
  usd: string;
  vnd: string;
  display: string;
  usdDollars: number;
  vndAmount: number;
  exchangeRate: number;
}

export interface CurrencyConfig {
  exchangeRate: number;
  primaryCurrency: 'USD' | 'VND';
  showBothCurrencies: boolean;
}
