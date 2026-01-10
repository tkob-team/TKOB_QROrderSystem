/**
 * Formatting utilities for settings display values
 */

const SLUG_BASE_URL = 'https://tkqr.app';

/**
 * Builds slug preview URL from restaurant slug
 */
export function buildSlugPreview(urlSlug: string): string {
  return `${SLUG_BASE_URL}/${urlSlug || 'your-restaurant'}`;
}

/**
 * Formats session timeout for display
 */
export function formatSessionTimeout(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Formats time slot for display
 */
export function formatTimeSlot(time: string): string {
  return time; // Already in HH:MM format from data
}
