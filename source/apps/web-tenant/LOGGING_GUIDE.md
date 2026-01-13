# Logging Guide - Web Tenant

**Last Updated:** January 13, 2026  
**App:** `source/apps/web-tenant`  
**Framework:** Next.js 14+ (App Router)

---

## Overview

This project includes a structured logging system for debugging data flow and API interactions during development. Logging helps you:

- **Track flow:** See when users navigate, when operations start/succeed/fail
- **Debug data shapes:** Verify request parameters and response structure without values
- **Inspect samples:** View redacted/truncated payload samples for deep debugging

**Important:** Logging is **OFF by default** and should **NEVER** be enabled in production.

### Key Concept: "Entering a page" ≠ "GET request fired"

When you navigate to a page, you'll see `[nav] SCREEN_ENTER` logs. However, this does NOT mean a GET request was immediately fired through axios. In Next.js App Router:
- Data may be server-rendered (no client axios call)
- Data may be cached (no network request)
- Mocks bypass axios entirely

To see request/response logs, you need:
1. Real API mode (`NEXT_PUBLIC_USE_MOCK_DATA=false`)
2. Client-side data fetching (not SSR)
3. Appropriate logging level enabled

---

## Logging Levels (3 Tiers)

### Level 1: Basic Flow Logs (Safe, Low Noise)
**Enable:** `NEXT_PUBLIC_USE_LOGGING=true`

**What you'll see:**
```
[nav] SCREEN_ENTER admin/menu
[menu] QUERY_ITEMS_ATTEMPT
[menu] QUERY_ITEMS_SUCCESS
[tables] MUTATION_CREATE_ATTEMPT
[tables] MUTATION_CREATE_ERROR { message: "Table number already exists" }
```

**Use when:** You want to trace what operations are happening without seeing data details.

---

### Level 2: Data Shape Inspection
**Enable:** `NEXT_PUBLIC_LOG_DATA=true` (requires `USE_LOGGING=true`)

**What you'll see:**
```
[data] REQUEST_PARAMS { method: "GET", url: "/api/v1/admin/menu/items", params: { categoryId: "cat-1", activeOnly: true } }
[data] RESPONSE_SHAPE { keys: ["data", "meta"], count: 15 }
[data] MAPPER_INPUT { shape: "MenuItemDto[]", count: 15 }
[data] MAPPER_OUTPUT { shape: "MenuItem[]", count: 15 }
[api:adapter] MODE { adapter: "real", baseURL: "https://api.example.com" }
```

**Use when:** You need to verify which endpoints are called, what parameters are sent, and what structure comes back—without seeing actual values.

---

### Level 3: Full Sample Values (Redacted + Truncated)
**Enable:** `NEXT_PUBLIC_LOG_DATA_FULL=true` (requires `LOG_DATA=true`)

**What you'll see:**
```
[data] REQUEST_BODY { categoryId: "cat-1", activeOnly: true }
[data] RESPONSE_BODY { data: [{ id: "item-1", name: "Margherita Pizza", price: 12.99, ... }, ...], meta: { total: 15 } }
[data] MAPPER_SAMPLE input={ id: "item-1", name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 12.99, ... }
[data] MAPPER_SAMPLE output={ id: "item-1", name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 12.99, ... }
[mock] REQUEST { feature: "menu", op: "item.create", payload: { name: "New Item", description: "...", categoryId: "cat-1" } }
[mock] RESPONSE { feature: "menu", op: "item.create", data: { id: "item-123", name: "New Item", ... } }
```

**Use when:** You need to inspect actual data values to debug mapping issues or verify mock mutations.

**⚠️ WARNING:** This is verbose and should only be enabled temporarily for targeted debugging.

---

## Mock vs Real API Expectations

### Real API Mode (`NEXT_PUBLIC_USE_MOCK_DATA=false`)
When using real APIs:
- Axios interceptors log `[api]` and `[data]` for requests/responses
- You'll see `REQUEST_PARAMS`, `RESPONSE_SHAPE`, `REQUEST_BODY`, `RESPONSE_BODY`
- Mappers log input/output transformation
- Adapter logs show "real" mode

### Mock Mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`)
When using mocks:
- **No axios logs** (mocks bypass axios entirely)
- Instead, see `[mock] REQUEST` and `[mock] RESPONSE` for mutations
- Query logs come from feature-level query/action logs (e.g., `[menu] QUERY_ITEMS_SUCCESS`)
- Adapter logs show "mock" mode

### Next.js Internal Requests
Next.js App Router server components may fetch data internally (`/_next/data/...` or `/_rsc?...`). These:
- Do **NOT** go through axios
- Do **NOT** trigger axios interceptor logs
- Are intentional (part of RSC architecture)

**Bottom line:** If you're in mock mode and don't see axios logs, that's expected. Look for `[mock]` and feature-level logs instead.

---

## How to Enable Logging

Create or edit `.env.local` in `source/apps/web-tenant/`:

### Minimal (Flow Only)
```bash
# See navigation and operation lifecycle only
NEXT_PUBLIC_USE_LOGGING=true
NEXT_PUBLIC_LOG_DATA=false
NEXT_PUBLIC_LOG_DATA_FULL=false
```

### Shape Debugging
```bash
# See flow + request params + response structure (no values)
NEXT_PUBLIC_USE_LOGGING=true
NEXT_PUBLIC_LOG_DATA=true
NEXT_PUBLIC_LOG_DATA_FULL=false
```

### Full Values Debugging (⚠️ Temporary Use Only)
```bash
# See everything: flow + shapes + sample values (redacted/truncated)
NEXT_PUBLIC_USE_LOGGING=true
NEXT_PUBLIC_LOG_DATA=true
NEXT_PUBLIC_LOG_DATA_FULL=true
```

**After changing `.env.local`:** Restart your dev server (`pnpm dev`).

---

## Safety & Redaction

### What Gets Redacted
The `samplePayload()` utility automatically redacts sensitive keys:
- `password`, `oldPassword`, `newPassword`, `confirmPassword`
- `token`, `accessToken`, `refreshToken`, `apiKey`, `secret`
- `email`, `phone`, `phoneNumber`
- `fullName`, `displayName`, `userName`
- `creditCard`, `ssn`, `cvv`

Example:
```javascript
// Raw data
{ email: "user@example.com", name: "John Doe", password: "secret123" }

// Logged (with LOG_DATA_FULL=true)
{ email: "[REDACTED]", name: "John Doe", password: "[REDACTED]" }
```

### What Gets Truncated
Large arrays/objects are truncated:
- Arrays: Show first 3 items, then `[...N more]`
- Nested objects: Truncate deeply nested structures

### Special Cases
- **Menu display fields** (`name`, `description`, `title`, `label`, `note`): Allowed in mapper logs for debugging
- **Passwords in settings**: `changePassword` logs only `{ hasOldPassword: true, hasNewPassword: true }`
- **File uploads**: Log metadata only (`filename`, `size`, `type`), not raw File objects
- **Query params**: Sanitized in axios logging; sensitive params redacted

### Production Safety
**NEVER enable these flags in production:**
- Set all to `false` or omit them entirely
- `.env.example` has safe defaults
- CI/CD should enforce this

---

## Debug Workflows

### Workflow 1: "I don't see any logs"

**Checklist:**
1. ✅ Verify `.env.local` has `NEXT_PUBLIC_USE_LOGGING=true`
2. ✅ Restart dev server after changing env (`Ctrl+C`, then `pnpm dev`)
3. ✅ Check browser console filters (not hiding "info" or "debug")
4. ✅ Set console log level to "Verbose" (Chrome DevTools)
5. ✅ Enable "Preserve log" to see logs across navigations
6. ✅ If in mock mode, expect `[mock]` logs, not `[api]` logs

---

### Workflow 2: "I need to verify data mapping"

**Steps:**
1. Enable logging:
   ```bash
   NEXT_PUBLIC_USE_LOGGING=true
   NEXT_PUBLIC_LOG_DATA=true
   NEXT_PUBLIC_LOG_DATA_FULL=true
   ```
2. Restart dev server
3. Reproduce the issue (e.g., load menu items)
4. In console, search for:
   - `MAPPER_SAMPLE input=` (see what API returned)
   - `MAPPER_SAMPLE output=` (see what mapper produced)
   - `RESPONSE_BODY` (see raw API response)
5. Compare input vs output to verify mapping correctness
6. When done, **disable** `LOG_DATA_FULL` and restart

**Pro tip:** Use console filter to show only `[data]` or `MAPPER` logs.

---

### Workflow 3: "Mock mode debugging"

**Context:** Mocks don't go through axios, so no `[api]` logs.

**Steps:**
1. Enable logging:
   ```bash
   NEXT_PUBLIC_USE_LOGGING=true
   NEXT_PUBLIC_LOG_DATA=true
   NEXT_PUBLIC_LOG_DATA_FULL=true
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```
2. Restart dev server
3. Perform a **mutation** (e.g., create menu item, update table)
4. In console, search for:
   - `[mock] REQUEST` (see what was sent to mock)
   - `[mock] RESPONSE` (see what mock returned)
5. For **queries** (read operations), look for:
   - `[menu] QUERY_*_SUCCESS` or similar feature-level logs
   - `[data] RESPONSE_SHAPE` (if available)
6. When done, **disable** `LOG_DATA_FULL` and restart

**Note:** Not all mock queries have detailed logs; focus on mutations for deep inspection.

---

## Appendix: Quick Grep Patterns

Use these to filter console output or search logs:

| Pattern | What it shows |
|---------|---------------|
| `[api]` | Axios interceptor logs (requests/responses) |
| `[data]` | Data inspection logs (params, shapes, bodies, mappers) |
| `[mock]` | Mock mutation request/response logs |
| `[nav]` | Navigation logs (screen enter, route changes) |
| `[menu]` | Menu feature-specific logs (queries, mutations) |
| `[tables]` | Tables feature-specific logs |

**Example:** In Chrome DevTools console, type in filter box: `[data]` to see only data logs.

---

## Summary

| Flag | Purpose | Use When | Safe in Prod? |
|------|---------|----------|---------------|
| `NEXT_PUBLIC_USE_LOGGING` | Basic flow tracking | Debugging operations | ❌ No |
| `NEXT_PUBLIC_LOG_DATA` | Shape inspection | Debugging API/mapper structure | ❌ No |
| `NEXT_PUBLIC_LOG_DATA_FULL` | Full sample values | Deep debugging (temporary) | ❌ **NEVER** |

**Default:** All flags OFF (`false` or omitted).  
**Development:** Enable as needed, restart server, disable when done.  
**Production:** Ensure all flags are `false` or omitted.

---

## Need Help?

- **No axios logs in mock mode?** Expected. Use `[mock]` logs instead.
- **Logs disappear on navigation?** Enable "Preserve log" in console.
- **Too much noise?** Use Level 1 only (`USE_LOGGING=true`, others `false`).
- **Need to see exact values?** Temporarily enable `LOG_DATA_FULL`, then disable.

Happy debugging! 🐛🔍
