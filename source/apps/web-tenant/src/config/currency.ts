/**
 * Currency configuration for web-tenant
 * This file centralizes currency settings for easy configuration
 */

export const CURRENCY_CONFIG = {
  // Currency symbol to display (e.g., '$', '€', '₫', '¥')
  symbol: '$',
  
  // Currency code (e.g., 'USD', 'VND', 'EUR')
  code: 'USD',
  
  // Number of decimal places to show for prices
  decimals: 2,
  
  // Format function for displaying prices
  format: (amount: number): string => {
    const absAmount = Math.abs(amount);
    const formatted = CURRENCY_CONFIG.decimals === 0 
      ? Math.round(absAmount).toLocaleString() 
      : absAmount.toFixed(CURRENCY_CONFIG.decimals);
    
    const sign = amount < 0 ? '-' : '';
    return `${sign}${CURRENCY_CONFIG.symbol}${formatted}`;
  },
};

export type CurrencyConfig = typeof CURRENCY_CONFIG;
