# Menu Feature Structure Guide

## Folder Responsibilities

### `data/`
- Mock data and data factories (`*Mock.ts`, `*Factory.ts`)
- Data adapters for source selection (API vs. mock) and transformation
- **Responsibility**: Data-access layer that abstracts data source (real API or mocks) without exposing it to components

### `hooks/`
- Custom React hooks for state management
- Query hooks and mutations
- Controller hooks that orchestrate business logic
- **Responsibility**: Handle data fetching, caching, and state coordination

### `model/`
- TypeScript interfaces and types
- Constants and enums
- Form data structures and validation schemas
- **Responsibility**: Define contracts and shared type definitions

### `ui/`
- React components organized by responsibility
- Pages, layouts, modals, and feature components
- **Responsibility**: Render UI and handle user interactions

### `utils/`
- Pure utility functions (`format*`, `calculate*`, `validate*`)
- Helper functions for transformations
- **Responsibility**: Reusable, dependency-free business logic

### `lib/`
- Library integrations and adapters
- External service wrappers
- **Responsibility**: Encapsulate third-party dependencies

---

## Import Rules

### ✅ Allowed Imports

| From | To | Allowed |
|------|-----|---------|
| `ui/**` | `hooks/**` | ✅ Yes |
| `ui/**` | `model/**` | ✅ Yes |
| `ui/**` | `utils/**` | ✅ Yes |
| `hooks/**` | `data/**` | ✅ Yes |
| `hooks/**` | `model/**` | ✅ Yes |
| `hooks/**` | `lib/**` | ✅ Yes |

### ❌ Forbidden Imports

| From | To | Allowed |
|------|-----|---------|
| `ui/**` | `data/**` | ❌ No - UI must not import mock data directly |
| `ui/**` | `hooks/queries/**` | ❌ No - Queries are controller internals; use controller hooks instead (e.g., `useMenuManagementController` wraps queries) |
| `pages/**` | Other `pages/**` | ❌ No - Pages should not import each other |
| `pages/**` | `data/**` | ❌ No - Pages import hooks only |

---

## Naming Conventions

### Hooks
- **Controller Hooks**: `useXxxController` - Orchestrates multiple related operations
  - Example: `useMenuManagementController` (fetches items, categories, handles mutations)
  
- **State Hooks**: `useXxxState` - Manages local component state
  - Example: `useFormState` (tracks form field values)
  
- **Query Hooks**: `useXxxQuery` or `useXxx` (from generated code)
  - Example: `useMenuItems`, `getMenuItemsQueryKey`

### Modal Structure
- **Component Files**: 
  - `ModifierGroupModal.tsx` - Actual component
  - `DeleteModifierGroupDialog.tsx` - Confirmation dialogs
  
- **Barrel Files**:
  - `modals/index.ts` - Re-exports actual modal components (when modals are wrappers)
  - `pages/index.ts` - Optional barrel for cleaner internal imports; not required for Next.js routing

- **Rule**: Create barrel if exporting 3+ items or for cleaner imports

### Data/Mock Files
- `*Mock.ts` - Mock data (arrays, constants)
- `*Factory.ts` - Data generation (for testing)
- `*Adapter.ts` - Data transformation between formats

---

## Barrel Files (index.ts)

### ✅ When to Create
- **Exporting 3+ items** from a folder
- **Public API**: Folder exports multiple related items
- **Cleaner imports**: `/components/modifiers` instead of `/components/modifiers/ModifierGroupModal`

### ❌ When NOT to Create
- **Single export**: Folder has only 1-2 items
- **Internal organization**: Private implementation details
- **Avoid barrel chains**: Don't barrel from a barrel

### Example Structure
```
ui/
├── components/
│   └── modifiers/
│       ├── ModifierGroupModal.tsx
│       ├── DeleteModifierGroupDialog.tsx
│       ├── ModifiersToolbar.tsx
│       └── index.ts  ✅ Barrel (3 items)
└── pages/
    ├── MenuHubPage.tsx
    ├── MenuManagementPage.tsx
    ├── MenuModifiersPage.tsx
    └── index.ts  ✅ Barrel (3+ pages)
```

### Barrel File Content
```typescript
// ui/components/modifiers/index.ts
export { ModifierGroupModal } from './ModifierGroupModal';
export { DeleteModifierGroupDialog } from './DeleteModifierGroupDialog';
export { ModifiersToolbar } from './ModifiersToolbar';
```

---

## Quick Reference: Data Flow

```
UI Pages
  ↓
  └─→ hooks/useXxxController
       ├─→ hooks/useXxxQuery (React Query)
       ├─→ hooks/useMutations
       └─→ data/mocks (if NEXT_PUBLIC_USE_MOCK_DATA)
            └─→ model/** (types)
```

**Rule**: Pages never import from `data/` or `lib/`. Hooks are the gatekeepers.
