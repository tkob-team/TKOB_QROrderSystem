# KDS Feature Refactor - Commit 1: Structure Normalization + Controller

## Completed Tasks

### 1. Folder Structure Created ✅
- `data/api/` - API adapters
- `data/mocks/` - Mock data and adapters
- `hooks/queries/` - Internal query hooks
- `utils/` - Utility functions
- `ui/pages/` - Page components
- `ui/components/sections/` - Section components
- `ui/components/cards/` - Card components

### 2. Data Layer Reorganization ✅
- Renamed: `data/kds-adapter.interface.ts` → `data/adapter.interface.ts`
- Moved: `data/api-kds.adapter.ts` → `data/api/api-kds.adapter.ts`
- Moved: `data/mock-kds.adapter.ts` → `data/mocks/mock-kds.adapter.ts`
- Created: `data/mocks/mock-kds.data.ts` (mock constants)
- Updated: `data/factory.ts` imports
- Updated: `data/index.ts` barrel with correct exports

### 3. Mock Data Extraction ✅
- Created: `data/mocks/mock-kds.data.ts` with `MOCK_KDS_ORDERS` constant
- Updated: `data/mocks/mock-kds.adapter.ts` to import from mock data file
- Removed: `MOCK_KDS_ORDERS` from `model/constants.ts`

### 4. Model Boundary Fixes ✅
- Removed: `lucide-react` import from `model/constants.ts`
- Removed: Tailwind class strings from model constants
- Removed: `KDS_BUTTON_CONFIG` (UI config) from model
- Removed: `formatKdsTime` (utility) from model
- Kept: Pure domain configurations (`KDS_COLUMNS`, `KDS_STATUS_CONFIG`, `OVERDUE_THRESHOLD`)
- Fixed: `KdsButtonConfig` type to avoid React.ComponentType

### 5. Utils Folder Created ✅
- `utils/formatKdsTime.ts` - Time formatting utility
- `utils/buttonConfig.ts` - UI-facing button configurations (may contain lucide-react and Tailwind)
- `utils/sortOrders.ts` - Order sorting utilities

### 6. Hooks Folder Created ✅
- `hooks/queries/useKdsOrders.ts` - Internal query hook (private)
- `hooks/useKdsController.ts` - PUBLIC controller orchestrating UI state, handlers, and queries
- `hooks/index.ts` - Barrel exporting ONLY useKdsController (queries NOT exported)

### 7. UI Files Reorganized ✅
- Moved: `ui/KdsBoardPage.tsx` → `ui/pages/KdsBoardPage.tsx` (refactored to use controller)
- Moved: `ui/KdsTicketCard.tsx` → `ui/components/cards/KdsTicketCard.tsx`
- Kept: `ui/KdsComponents.tsx` at root (will be moved to sections in Commit 2)
- Updated: All imports to new paths

### 8. Duplicate Root Files Removed ✅
- Deleted: `src/features/kds/types.ts` (root duplicate)
- Deleted: `src/features/kds/constants.ts` (root duplicate)

### 9. All Imports Updated ✅
- UI pages import ONLY from: `hooks/` (controller), `model/`, `utils/`
- UI components import ONLY from: `hooks/` (controller), `model/`, `utils/`, sibling UI files
- No UI imports from `data/` or `hooks/queries/`
- Controller imports from `data/factory` and internal queries

### 10. Routes Updated ✅
- Updated: `src/app/kds/page.tsx` to import from feature barrel (not direct path)

## Validation

### Type-Check ✅
```
source/apps/web-tenant type-check: tsc --noEmit
source/apps/web-tenant type-check: Done
```

### Lint ✅
```
ESLint passed with no errors, no warnings on src/features/kds
```

### Import Boundary Rules ✅
- ✅ UI pages/components do NOT import from `data/**`
- ✅ UI pages/components do NOT import from `hooks/queries/**`
- ✅ Model does NOT contain React/lucide-react imports
- ✅ Model does NOT contain Tailwind class strings
- ✅ Model does NOT contain mock data
- ✅ Hooks barrel exports ONLY controller hook
- ✅ Pages/components import ONLY from hooks (controller), model, utils

## What Changed (Business Logic)

**NOTHING** - This is a pure structure refactoring. All UI behavior, state management, and logic remain identical:
- Order state management works the same way
- Event handlers are unchanged
- Sorting logic preserved
- Toast notifications work the same
- Time updates work the same
- All user interactions unchanged

## File Structure (Post-Refactor)

```
src/features/kds/
├── data/
│   ├── adapter.interface.ts
│   ├── factory.ts
│   ├── index.ts
│   ├── api/
│   │   └── api-kds.adapter.ts
│   └── mocks/
│       ├── mock-kds.adapter.ts
│       └── mock-kds.data.ts
├── model/
│   ├── types.ts (no React/UI imports)
│   ├── constants.ts (pure domain only)
│   └── index.ts
├── hooks/
│   ├── queries/
│   │   ├── useKdsOrders.ts (INTERNAL)
│   │   └── index.ts (NOT exported)
│   ├── useKdsController.ts (PUBLIC)
│   └── index.ts (exports controller only)
├── utils/
│   ├── formatKdsTime.ts
│   ├── buttonConfig.ts
│   └── sortOrders.ts
├── ui/
│   ├── pages/
│   │   └── KdsBoardPage.tsx (refactored to use controller)
│   ├── components/
│   │   ├── sections/ (reserved for future)
│   │   └── cards/
│   │       └── KdsTicketCard.tsx
│   ├── KdsComponents.tsx (to be moved to sections in Commit 2)
│   └── KDSBoard.tsx (legacy, kept for now)
├── index.ts (feature barrel)
└── FEATURE_STRUCTURE_AUDIT.md
```

## Next Steps

**Commit 2** will:
1. Split `KdsComponents.tsx` (346 LOC god file) into sections
2. Refactor page state into controller (already done - just need to verify)
3. Final cleanup of legacy files

---

**Commit Date:** January 8, 2026  
**Type:** refactor  
**Scope:** kds  
**Message:** "refactor(kds): normalize feature structure + introduce controller"
