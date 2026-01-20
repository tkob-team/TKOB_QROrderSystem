import Fuse from 'fuse.js';

/**
 * Fuzzy Search Utility
 * Provides typo-tolerant search functionality for menu items and other entities
 * Uses Fuse.js library for fuzzy matching
 */

export interface FuzzySearchOptions<T> {
  keys: (keyof T | { name: keyof T; weight?: number })[] | string[]; // Fields to search in
  threshold?: number; // 0.0 = perfect match, 1.0 = match anything (default: 0.3)
  distance?: number; // Maximum distance between matches (default: 100)
  minMatchCharLength?: number; // Minimum character length to match (default: 2)
}

/**
 * Perform fuzzy search on a collection of items
 * @param items - Array of items to search
 * @param query - Search query string
 * @param options - Fuzzy search configuration
 * @returns Filtered and ranked results
 */
export function fuzzySearch<T>(items: T[], query: string, options: FuzzySearchOptions<T>): T[] {
  if (!query || query.trim() === '') {
    return items;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fuseOptions: any = {
    keys: options.keys,
    threshold: options.threshold ?? 0.3, // Lower = more strict (0.3 = good balance)
    distance: options.distance ?? 100,
    minMatchCharLength: options.minMatchCharLength ?? 2,
    includeScore: true,
    ignoreLocation: true, // Search anywhere in the string
    useExtendedSearch: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const fuse = new Fuse(items, fuseOptions);
  const results = fuse.search(query);

  // Return items sorted by relevance score
  return results.map((result) => result.item);
}

/**
 * Check if a query would produce fuzzy match results
 * Useful for determining if fuzzy search should be applied
 */
export function shouldUseFuzzySearch(query: string): boolean {
  return Boolean(query && query.trim().length >= 2);
}

/**
 * Preset configurations for common search scenarios
 */
export const FuzzySearchPresets = {
  /**
   * Menu item search configuration
   * Searches across name, description, and tags
   */
  MENU_ITEMS: {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4, // Slightly more lenient for menu items
    distance: 100,
    minMatchCharLength: 2,
  } as FuzzySearchOptions<any>,

  /**
   * Strict search for exact-ish matches
   */
  STRICT: {
    keys: ['name'],
    threshold: 0.2,
    distance: 50,
    minMatchCharLength: 3,
  } as FuzzySearchOptions<any>,

  /**
   * Lenient search for more forgiving matches
   */
  LENIENT: {
    keys: ['name', 'description'],
    threshold: 0.5,
    distance: 150,
    minMatchCharLength: 2,
  } as FuzzySearchOptions<any>,
};
