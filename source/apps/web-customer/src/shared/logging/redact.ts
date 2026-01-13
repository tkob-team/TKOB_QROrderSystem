// Redaction utilities to keep PII and sensitive values out of logs.
// Targets: qrToken, sessionId, orderId, paymentMethod, amount, session objects.

const MASK = '***';

function maskString(value: string): string {
  if (!value) return MASK;
  if (value.length <= 4) return MASK;
  return `${MASK}${value.slice(-4)}`;
}

function maskAmount(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return MASK;
  return `~${num.toFixed(2)}`;
}

function sanitizePaymentMethod(value: unknown): string {
  if (typeof value !== 'string') return MASK;
  // Keep coarse info only
  return value.slice(0, 1) + '*';
}

export function redactPayload<T>(payload: T): T {
  if (payload === null || payload === undefined) return payload;

  if (Array.isArray(payload)) {
    // Redact each element shallowly
    return payload.map((item) => redactPayload(item)) as unknown as T;
  }

  if (typeof payload === 'object') {
    const input = payload as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (key === 'qrToken' || key === 'sessionId' || key === 'orderId' || key === 'token') {
        output[key] = typeof value === 'string' ? maskString(value) : MASK;
        continue;
      }
      if (key.toLowerCase().includes('amount') || key === 'total') {
        output[key] = maskAmount(value);
        continue;
      }
      if (key === 'paymentMethod') {
        output[key] = sanitizePaymentMethod(value);
        continue;
      }
      if (key === 'session' && typeof value === 'object' && value !== null) {
        const sessionObj = value as Record<string, unknown>;
        output[key] = {
          sessionId: sessionObj.sessionId ? maskString(String(sessionObj.sessionId)) : MASK,
          tableId: sessionObj.tableId ? maskString(String(sessionObj.tableId)) : MASK,
          tableNumber: sessionObj.tableNumber ?? MASK,
          tenantId: sessionObj.tenantId ? maskString(String(sessionObj.tenantId)) : MASK,
          restaurantName: sessionObj.restaurantName ? `${String(sessionObj.restaurantName).slice(0, 3)}*` : MASK,
        };
        continue;
      }
      // Recurse for nested objects/arrays
      output[key] = redactPayload(value as unknown as Record<string, unknown>);
    }
    return output as unknown as T;
  }

  return payload;
}

export function summarizeIds(items: Array<{ id?: string }>): { count: number; sampleIds?: string[] } {
  const maskedIds = items
    .map((item) => (item?.id ? maskString(String(item.id)) : undefined))
    .filter(Boolean) as string[];
  return {
    count: items.length,
    sampleIds: maskedIds.slice(0, 3),
  };
}
