/**
 * Fuzzy Search Utility
 * FEAT-15: Implements fuzzy matching for menu search
 * 
 * Uses a simple but effective Levenshtein-based approach
 * without external dependencies.
 */

export interface SearchableItem {
  id: string
  name: string
  description?: string
  category?: string
  tags?: string[]
}

export interface SearchResult<T extends SearchableItem> {
  item: T
  score: number
  matches: {
    field: string
    indices: [number, number][]
  }[]
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function similarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Check if query is a substring match
 */
function substringMatch(text: string, query: string): [number, number][] {
  const indices: [number, number][] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  let pos = 0
  while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
    indices.push([pos, pos + query.length])
    pos += 1
  }
  
  return indices
}

/**
 * Check if query words match as prefixes
 */
function prefixMatch(text: string, query: string): boolean {
  const textWords = text.toLowerCase().split(/\s+/)
  const queryWords = query.toLowerCase().split(/\s+/)
  
  return queryWords.every(qWord => 
    textWords.some(tWord => tWord.startsWith(qWord))
  )
}

/**
 * Search configuration options
 */
export interface FuzzySearchOptions {
  /** Minimum score to include in results (0-1) */
  threshold?: number
  /** Maximum number of results */
  limit?: number
  /** Fields to search (default: name, description, category) */
  keys?: string[]
  /** Enable fuzzy matching (vs exact substring) */
  fuzzy?: boolean
}

const DEFAULT_OPTIONS: Required<FuzzySearchOptions> = {
  threshold: 0.3,
  limit: 20,
  keys: ['name', 'description', 'category'],
  fuzzy: true,
}

/**
 * Perform fuzzy search on a list of items
 */
export function fuzzySearch<T extends SearchableItem>(
  items: T[],
  query: string,
  options?: FuzzySearchOptions
): SearchResult<T>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const normalizedQuery = query.trim().toLowerCase()
  
  if (!normalizedQuery) {
    return items.slice(0, opts.limit).map(item => ({
      item,
      score: 1,
      matches: [],
    }))
  }
  
  const results: SearchResult<T>[] = []
  
  for (const item of items) {
    let bestScore = 0
    const matches: SearchResult<T>['matches'] = []
    
    for (const key of opts.keys) {
      const value = (item as any)[key]
      if (typeof value !== 'string') continue
      
      const normalizedValue = value.toLowerCase()
      
      // Priority 1: Exact match
      if (normalizedValue === normalizedQuery) {
        bestScore = 1
        matches.push({ field: key, indices: [[0, value.length]] })
        continue
      }
      
      // Priority 2: Substring match
      const substringIndices = substringMatch(value, normalizedQuery)
      if (substringIndices.length > 0) {
        const score = 0.8 + (0.2 * (normalizedQuery.length / normalizedValue.length))
        if (score > bestScore) bestScore = score
        matches.push({ field: key, indices: substringIndices })
        continue
      }
      
      // Priority 3: Prefix match (word starts with query)
      if (prefixMatch(value, normalizedQuery)) {
        const score = 0.6
        if (score > bestScore) bestScore = score
        matches.push({ field: key, indices: [] })
        continue
      }
      
      // Priority 4: Fuzzy match
      if (opts.fuzzy) {
        const sim = similarity(normalizedValue, normalizedQuery)
        if (sim > bestScore) bestScore = sim
      }
    }
    
    // Also check tags if present
    if (item.tags && Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        const normalizedTag = tag.toLowerCase()
        if (normalizedTag.includes(normalizedQuery)) {
          const score = 0.7
          if (score > bestScore) bestScore = score
          matches.push({ field: 'tags', indices: [] })
        }
      }
    }
    
    if (bestScore >= opts.threshold) {
      results.push({ item, score: bestScore, matches })
    }
  }
  
  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score)
  
  return results.slice(0, opts.limit)
}

/**
 * Simple search - returns items directly (no score)
 */
export function searchItems<T extends SearchableItem>(
  items: T[],
  query: string,
  options?: FuzzySearchOptions
): T[] {
  return fuzzySearch(items, query, options).map(r => r.item)
}

/**
 * Highlight matching text in a string
 */
export function highlightMatches(
  text: string,
  indices: [number, number][]
): { text: string; highlighted: boolean }[] {
  if (indices.length === 0) {
    return [{ text, highlighted: false }]
  }
  
  const parts: { text: string; highlighted: boolean }[] = []
  let lastEnd = 0
  
  // Sort indices by start position
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0])
  
  for (const [start, end] of sortedIndices) {
    if (start > lastEnd) {
      parts.push({ text: text.slice(lastEnd, start), highlighted: false })
    }
    parts.push({ text: text.slice(start, end), highlighted: true })
    lastEnd = end
  }
  
  if (lastEnd < text.length) {
    parts.push({ text: text.slice(lastEnd), highlighted: false })
  }
  
  return parts
}
