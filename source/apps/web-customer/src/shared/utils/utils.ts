// Utility functions

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { logError } from '@/shared/logging/logger'
import { CartItem } from '@/types';
import { TAX_RATE, SERVICE_CHARGE_RATE } from '@/shared/config/constants';

/**
 * Combine class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price in Vietnamese Dong
 */
export function formatVND(amount: number): string {
  const vndAmount = Math.round(amount * 1000); // Simple conversion for display
  return vndAmount.toLocaleString('vi-VN') + 'đ';
}

/**
 * Format price display (VND or USD)
 */
export function formatPrice(amount: number, currency: 'VND' | 'USD' = 'VND'): string {
  if (currency === 'VND') {
    return formatVND(amount);
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate total price for a single cart item
 */
export function calculateCartItemTotal(item: CartItem): number {
  let total = item.menuItem.basePrice;
  
  // Add size price
  if (item.selectedSize && item.menuItem.sizes) {
    const size = item.menuItem.sizes.find(s => s.size === item.selectedSize);
    if (size) {
      total = size.price;
    }
  }
  
  // Add topping prices
  if (item.menuItem.toppings) {
    item.selectedToppings.forEach(toppingId => {
      const topping = item.menuItem.toppings!.find(t => t.id === toppingId);
      if (topping) {
        total += topping.price;
      }
    });
  }
  
  return total * item.quantity;
}

/**
 * Calculate cart totals (subtotal, tax, service charge, total)
 */
export function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + calculateCartItemTotal(item), 0);
  const tax = subtotal * TAX_RATE;
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const total = subtotal + tax + serviceCharge;
  
  return { subtotal, tax, serviceCharge, total };
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date
 */
export function formatDate(date: Date, locale: 'en' | 'vi' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format time
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date, locale: 'en' | 'vi' = 'en'): string {
  return `${formatDate(date, locale)} ${formatTime(date)}`;
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safe localStorage get
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // Safety net: always log to console
    console.error(`Error reading localStorage key "${key}":`, error);
    
    // Structured logging (gated, won't crash if logger has issues)
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      try {
        logError('data', 'localStorage read failed', error instanceof Error ? error : new Error(String(error)), {
          feature: 'storage'
        })
      } catch {
        // Silent fail - console.error above is our safety net
      }
    }
    return defaultValue;
  }
}

/**
 * Safe localStorage set
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Safety net: always log to console
    console.error(`Error setting localStorage key "${key}":`, error);
    
    // Structured logging (gated, won't crash if logger has issues)
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      try {
        logError('data', 'localStorage write failed', error instanceof Error ? error : new Error(String(error)), {
          feature: 'storage'
        })
      } catch {
        // Silent fail - console.error above is our safety net
      }
    }
  }
}

/**
 * Safe localStorage remove
 */
export function removeLocalStorage(key: string): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Safety net: always log to console
    console.error(`Error removing localStorage key "${key}":`, error);
    
    // Structured logging (gated, won't crash if logger has issues)
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      try {
        logError('data', 'localStorage remove failed', error instanceof Error ? error : new Error(String(error)), {
          feature: 'storage'
        })
      } catch {
        // Silent fail - console.error above is our safety net
      }
    }
  }
}
