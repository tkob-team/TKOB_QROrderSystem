# Logging utilities (web-customer)

Production-safe console logging with env gating, deduplication, and PII redaction. Mirrors tenant patterns but stays lightweight for customer app.

## Env flags
- `NEXT_PUBLIC_USE_LOGGING` (default false): master kill-switch.
- `NEXT_PUBLIC_LOG_DATA` (default false): allow sending structured payloads.
- `NEXT_PUBLIC_LOG_DATA_FULL` (default false): when true, log redacted payloads fully; when false, use summaries and counts.

## Categories
Use one of `nav`, `data`, `mock`, `ui` to tag messages.

## API
- `log(category, message, payload?, options?)`
- `logError(category, message, err?, options?)`

Options: `{ feature?: string; route?: string; dedupe?: boolean; dedupeTtlMs?: number }`.

## Behaviors
- Dedupe: enabled by default for `log`, opt-in for `logError`. TTL default from deduper (currently 5s), adjustable per-call.
- Redaction: payloads flow through `redactPayload` when logging is allowed.
- Summaries: when `LOG_DATA` is true but `LOG_DATA_FULL` is false, arrays log `{ count }` unless they carry `id` fields, in which case a summarized list of ids is shown.

## Usage examples
```ts
import { log, logError } from '@/shared/logging/logger';

log('nav', 'Entered menu page', { tableId: 'tbl-123' }, { feature: 'menu', route: '/menu' });

log('data', 'Loaded menu items', items, { feature: 'menu', dedupe: true });

try {
  // ...
} catch (err) {
  logError('data', 'Failed to fetch orders', err, { feature: 'orders', dedupe: true });
}
```

## Notes
- Keep payloads lean; prefer identifiers over full objects unless investigating. Avoid logging secrets/tokens entirely.
- To disable logging in production, leave env flags unset or false.
