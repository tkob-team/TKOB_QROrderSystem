# Fuzzy Search Feature Implementation

## Overview
Implemented fuzzy search with typo tolerance for menu item searches in both the backend API and frontend customer application. This enhancement allows customers to find menu items even with spelling mistakes or partial queries.

## Changes Made

### 1. Backend (NestJS API)

#### New Files
- **`source/apps/api/src/common/utils/fuzzy-search.util.ts`**
  - Core fuzzy search utility using Fuse.js library
  - Provides configurable fuzzy matching with weighted fields
  - Includes presets for different search scenarios

#### Modified Files
- **`source/apps/api/src/modules/menu/repositories/menu-item.repository.ts`**
  - Integrated fuzzy search in `findFiltered()` method
  - Applied after database query to filter results with typo tolerance
  - Preserves pagination and other filters

#### Dependencies Added
- `fuse.js@^7.1.0` - Fuzzy search library

### 2. Frontend (Next.js Customer App)

#### Modified Files
- **`source/apps/web-customer/src/features/menu/ui/pages/MenuPage.tsx`**
  - Updated `filteredItems` useMemo to use fuzzy search
  - Integrated with existing filters (category, chef recommended)
  - Maintains search performance with 2+ character minimum

#### Existing Utilities
- **`source/apps/web-customer/src/shared/utils/fuzzySearch.ts`**
  - Already existed with custom Levenshtein algorithm
  - No changes needed, works perfectly with the new integration

#### Dependencies Added
- `fuse.js@^7.1.0` - For consistency with backend (frontend uses custom implementation)

### 3. Documentation

#### New Files
- **`docs/features/fuzzy-search.md`**
  - Comprehensive documentation of the feature
  - Usage examples and test cases
  - Configuration tuning guide

## Features

### Typo Tolerance
- Handles common typing mistakes
- Examples:
  - "chiken" → finds "Chicken Wings", "Grilled Chicken"
  - "spageti" → finds "Spaghetti Carbonara"
  - "burgar" → finds "Burger", "Cheeseburger"

### Partial Matching
- Matches items with partial words
- Examples:
  - "chick" → finds anything with "chicken"
  - "veg" → finds "Vegetable", "Vegan", "Veggie"

### Weighted Fields
- **Name**: 60% weight (highest priority)
- **Description**: 30% weight
- **Tags/Category**: 10% weight

### Configurable Threshold
- Default: 0.4 (balanced)
- Range: 0.0 (strict) to 1.0 (lenient)

## Configuration

### Backend Configuration
```typescript
// In fuzzy-search.util.ts
FuzzySearchPresets.MENU_ITEMS = {
  keys: [
    { name: 'name', weight: 0.6 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2
}
```

### Frontend Configuration
```typescript
// In MenuPage.tsx
searchItems(items, searchQuery, {
  threshold: 0.3,
  fuzzy: true,
  keys: ['name', 'description', 'category']
})
```

## Testing

### Manual Testing
1. Start the backend API: `pnpm --filter @app/api dev`
2. Start the customer app: `pnpm --filter @apps/web-customer dev`
3. Navigate to the menu page
4. Try these searches:
   - "chiken" (should find chicken items)
   - "spageti" (should find spaghetti)
   - "burgar" (should find burgers)
   - "fride rice" (should find fried rice)

### Test Cases
See `docs/features/fuzzy-search.md` for comprehensive test cases

## API Impact

### Endpoint: `GET /api/v1/menu/item`
- **Query Parameter**: `search` (string, optional)
- **Behavior**: 
  - If `search` is provided with 2+ characters, fuzzy search is applied
  - Results are ranked by relevance
  - All other filters (category, status, etc.) work as before

### Example API Requests
```bash
# Search for chicken (with typo)
GET /api/v1/menu/item?search=chiken

# Search with category filter
GET /api/v1/menu/item?search=burg&categoryId=abc-123

# Search with chef recommended
GET /api/v1/menu/item?search=spag&chefRecommended=true
```

## Performance Considerations

### Backend
- Fuzzy search runs **after** database query (on filtered results)
- Minimal performance impact for typical menu sizes (< 500 items)
- No additional database queries

### Frontend
- Real-time fuzzy search in browser
- Debounced search input (existing implementation)
- No API calls during typing (client-side filtering)

## Future Enhancements

1. **Synonym Support**: Add common food synonyms (burger ↔ hamburger)
2. **Vietnamese Diacritics**: Support Vietnamese language searches
3. **Search Analytics**: Track popular searches and typos
4. **Result Highlighting**: Highlight matched terms in UI
5. **Search Suggestions**: Auto-complete based on fuzzy matches

## Breaking Changes
None. This is a backward-compatible enhancement.

## Rollback
To rollback:
1. Remove fuzzy search logic from `menu-item.repository.ts`
2. Restore original search in `MenuPage.tsx`
3. Uninstall `fuse.js` if desired

## Commit Message
```
feat: Add fuzzy search for menu items with typo tolerance

- Implement fuzzy search using Fuse.js in backend API
- Integrate fuzzy search in customer menu page
- Support typo-tolerant searches (chiken → chicken)
- Add weighted field search (name, description, tags)
- Configure threshold for balance between strictness and flexibility
- Add comprehensive documentation

Resolves: Feature request for better search experience
```
