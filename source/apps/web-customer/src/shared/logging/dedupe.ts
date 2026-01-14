// Lightweight deduplication helper to curb re-render log spam.
// Uses in-memory timestamps; intended for client-only usage.

const MAX_KEYS = 200;
const defaultTtlMs = 2000;

class Deduper {
  private seen = new Map<string, number>();

  shouldLog(key: string, ttlMs: number = defaultTtlMs): boolean {
    const now = Date.now();
    const last = this.seen.get(key);
    if (last && now - last < ttlMs) {
      return false;
    }
    this.seen.set(key, now);
    if (this.seen.size > MAX_KEYS) {
      // Trim oldest to bound memory
      const oldestKey = [...this.seen.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
      if (oldestKey) this.seen.delete(oldestKey);
    }
    return true;
  }
}

export const globalDeduper = new Deduper();

export function makeDedupeKey(params: { feature?: string; route?: string; message: string }): string {
  const { feature = 'unknown', route = typeof window !== 'undefined' ? window.location.pathname : 'ssr', message } = params;
  return `${feature}::${route}::${message}`;
}
