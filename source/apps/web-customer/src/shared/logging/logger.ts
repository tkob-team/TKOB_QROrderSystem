// Production-safe logger with env gates and PII controls.
// Categories: [nav] [data] [mock] [ui]

import { globalDeduper, makeDedupeKey } from './dedupe';
import { redactPayload, summarizeIds } from './redact';

type Category = 'nav' | 'data' | 'mock' | 'ui';

const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';
const LOG_DATA = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
const LOG_DATA_FULL = process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

interface LogOptions {
  feature?: string;
  route?: string;
  dedupe?: boolean;
  dedupeTtlMs?: number;
}

function formatPrefix(category: Category): string {
  return `[${category}]`;
}

function safeConsole(category: Category, message: string, data?: unknown) {
  const prefix = formatPrefix(category);
  if (data === undefined) {
    // eslint-disable-next-line no-console
    console.log(prefix, message);
  } else {
    // eslint-disable-next-line no-console
    console.log(prefix, message, data);
  }
}

function preparePayload(payload: unknown): unknown {
  if (!LOG_DATA) return undefined;
  if (payload === undefined || payload === null) return payload;
  if (LOG_DATA_FULL) return redactPayload(payload);

  // Sampling / summarizing mode
  if (Array.isArray(payload)) {
    // Try to summarize arrays of objects with ids; otherwise show count only
    const hasIds = payload.some((item) => item && typeof item === 'object' && 'id' in (item as any));
    if (hasIds) {
      return summarizeIds(payload as Array<{ id?: string }>);
    }
    return { count: payload.length };
  }

  if (typeof payload === 'object') {
    return redactPayload(payload);
  }

  return payload;
}

export function log(category: Category, message: string, payload?: unknown, options: LogOptions = {}): void {
  if (!USE_LOGGING) return;

  const { feature, route, dedupe = true, dedupeTtlMs } = options;
  const dedupeKey = dedupe ? makeDedupeKey({ feature, route, message }) : null;
  if (dedupe && dedupeKey && !globalDeduper.shouldLog(dedupeKey, dedupeTtlMs)) {
    return;
  }

  const data = preparePayload(payload);
  safeConsole(category, message, data ?? undefined);
}

export function logError(category: Category, message: string, err?: unknown, options: LogOptions = {}): void {
  if (!USE_LOGGING) return;

  const { feature, route, dedupe = false, dedupeTtlMs } = options;
  const dedupeKey = dedupe ? makeDedupeKey({ feature, route, message }) : null;
  if (dedupe && dedupeKey && !globalDeduper.shouldLog(dedupeKey, dedupeTtlMs)) {
    return;
  }

  const payload = LOG_DATA ? redactPayload(normalizeError(err)) : undefined;
  const prefix = formatPrefix(category);
  // eslint-disable-next-line no-console
  console.error(prefix, message, payload);
}

function normalizeError(err: unknown): Record<string, unknown> {
  if (!err) return { error: 'unknown' };
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  if (typeof err === 'object') return err as Record<string, unknown>;
  return { error: String(err) };
}
