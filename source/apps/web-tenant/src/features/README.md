# Feature Template Standard

**Effective Date:** January 4, 2026  
**Status:** Active  
**Purpose:** Standardize feature structure across web-tenant

---

## 📁 Standard Feature Structure

Every feature MUST follow this structure:

```
features/<feature>/
  ├── ui/              # React components (pages + feature-specific components)
  ├── model/           # types.ts + constants.ts + mapping.ts (pure TypeScript)
  ├── data/            # api.ts + mock.ts + factory.ts (DI layer)
  ├── hooks/           # useXxxQuery.ts, useXxxActions.ts (React hooks)
  ├── config/          # (optional) feature-specific flags/config
  └── index.ts         # Public API (barrel exports)
```

### Segment Descriptions

| Folder    | Purpose            | Contains                           | Rules                                      |
| --------- | ------------------ | ---------------------------------- | ------------------------------------------ |
| `ui/`     | Presentation layer | React components, pages            | Client components, import from hooks/model |
| `model/`  | Business domain    | types, constants, mappers          | Pure TS, no React, no imports from ui/data |
| `data/`   | Data access layer  | API adapter, mock adapter, factory | Implements repository pattern              |
| `hooks/`  | React integration  | React Query hooks, custom hooks    | Bridge between ui and data                 |
| `config/` | Feature config     | Feature flags, route config        | (Optional, only if needed)                 |

---

## 🎯 State Management Policy

| Type                 | Solution                   | Location                              | Example                   |
| -------------------- | -------------------------- | ------------------------------------- | ------------------------- |
| **Server state**     | React Query                | `hooks/useXxxQuery.ts`                | Fetching menu items       |
| **URL state**        | `useSearchParams` + nuqs   | `hooks/useXxxFilters.ts`              | Table filters, pagination |
| **Feature UI state** | `useState`/`useReducer`    | Component or `hooks/useXxxUiState.ts` | Modal open, selected row  |
| **Global state**     | Zustand (only when needed) | `model/store.ts`                      | Cart, cross-feature state |

### When to use Zustand?

Only when:

- Multiple distant components need shared state
- State persists across routes
- Complex optimistic UI updates

**Default:** Prefer React Query for server state, useState for local UI state.

---

## 📝 File Naming Conventions

### Component Files

- PascalCase: `MenuItemCard.tsx`, `OrdersList.tsx`
- Co-located tests: `MenuItemCard.test.tsx`

### Hook Files

- camelCase with `use` prefix: `useMenuQuery.ts`, `useOrderActions.ts`
- If single hook file: `hooks.ts` at root (only if < 3 hooks)
- If multiple: create `hooks/` folder

### Model Files

- `types.ts` - Type definitions
- `constants.ts` - Constants, mock data
- `mapping.ts` - Status/data mappers

### Data Files

- `api.ts` - Real API adapter (calls `services/generated`)
- `mock.ts` - Mock adapter (returns mock data)
- `factory.ts` - Selects api/mock based on `featureFlags`
- `types.ts` - (Optional) adapter interface

---

## 🚫 Anti-Patterns to Avoid

### ❌ DON'T:

```typescript
// DON'T import directly from services/generated in UI
import { menuControllerGetAll } from '@/services/generated';

// DON'T import feature internals from other features
import { MenuItemCard } from '@/features/menu/ui/MenuItemCard';

// DON'T have duplicate constants.ts at root and model/
features/orders/
  constants.ts        ❌
  model/
    constants.ts      ❌ DUPLICATE
```

### ✅ DO:

```typescript
// DO use data factory
import { menuData } from '@/features/menu/data';

// DO import from feature's public API
import { MenuItemCard } from '@/features/menu';

// DO have single source of truth
features/orders/
  model/
    constants.ts      ✅ SINGLE SOURCE
  index.ts            # Re-export if needed
```

---

## 📦 Barrel Exports (index.ts)

Every feature MUST have `index.ts` that exports public API:

```typescript
// features/menu/index.ts

// UI Pages
export { MenuHubPage } from "./ui/pages/MenuHubPage";
export { MenuItemCard } from "./ui/components/MenuItemCard";

// Hooks (if used by other features/pages)
export { useMenuQuery, useMenuCRUD } from "./hooks";

// Types (public)
export type { MenuItem, MenuCategory } from "./model/types";
export { MENU_CATEGORIES } from "./model/constants";

// DO NOT export:
// - Internal UI components (MenuItemModal, MenuForm - used only inside feature)
// - Data layer (api, mock, factory - encapsulated)
// - Internal helpers
```

---

## 🏗️ Data Layer Pattern (DI)

### Structure

```
features/<feature>/data/
  ├── api.ts           # Real API calls
  ├── mock.ts          # Mock data
  ├── factory.ts       # Selects api/mock
  ├── types.ts         # (Optional) Interface
  └── index.ts         # Export factory
```

### Example: Orders Data Layer

**api.ts:**

```typescript
import { orderControllerGetAll } from "@/services/generated/orders/orders";

export const ordersApi = {
  async getOrders() {
    return await orderControllerGetAll();
  },
};
```

**mock.ts:**

```typescript
import { INITIAL_ORDERS } from "../model/constants";

export const ordersMock = {
  async getOrders() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return INITIAL_ORDERS;
  },
};
```

**factory.ts:**

```typescript
import { isMockEnabled } from "@/shared/config/featureFlags";
import { ordersApi } from "./api";
import { ordersMock } from "./mock";

export const ordersData = isMockEnabled("orders") ? ordersMock : ordersApi;
```

**Usage in hooks:**

```typescript
// features/orders/hooks/useOrders.ts
import { useQuery } from "@tanstack/react-query";
import { ordersData } from "../data";

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersData.getOrders(),
  });
};
```

---

## ✅ Checklist for New Feature

When creating a new feature:

- [ ] Create folder: `features/<feature>/`
- [ ] Create `ui/` with page component
- [ ] Create `model/` with `types.ts` and `constants.ts`
- [ ] Create `data/` with `api.ts`, `mock.ts`, `factory.ts`
- [ ] Create `hooks/` with React Query hooks
- [ ] Create `index.ts` with public exports
- [ ] Add feature to `featureFlags.ts` mock config
- [ ] Update app route to import from feature's public API
- [ ] Verify no direct imports to `services/generated` in UI
- [ ] Run `pnpm build` and `pnpm lint` - no errors

---

## 📚 Reference Examples

### ✅ Good Examples (follow these):

- `features/tables/` - Complete DI pattern with api/mock/factory
- `features/auth/` - Clean data layer with factory pattern

### ⚠️ Needs Update:

- `features/menu/` - Has Zustand store, consider migrating to React Query
- Small features - May not need full structure if < 6 files

---

## 🔄 Migration Guide (for existing features)

If feature doesn't follow template:

1. **Create missing folders** (`ui/`, `model/`, `data/`)
2. **Move files to correct segments:**
   - Components → `ui/`
   - Types/constants → `model/`
   - Create `data/` layer if missing
3. **Remove duplicates:**
   - Keep types/constants in `model/` only
   - Remove root `constants.ts` or make it re-export
4. **Update imports** in consuming code
5. **Verify** with build/lint

---

## 🆘 Questions?

- Check existing `features/tables/` for reference
- Read [REFACTOR_PLAN_VI.md](../REFACTOR_PLAN_VI.md)
- Ask team lead for clarification

**Last Updated:** January 4, 2026  
**Maintainer:** Development Team
