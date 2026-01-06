# 📦 Shared Patterns - UI Foundation

**Reusable UI patterns** cho web-tenant app. Các component này compose nhiều primitives lại, dùng chung giữa các features.

---

## 📁 Structure

```
shared/patterns/
├── PageHeader.tsx          # Page title + subtitle + actions slot
├── FilterBar.tsx           # Search + filters + clear action
├── StatusPill.tsx          # Config-based status badges + mappings
├── EmptyState.tsx          # Empty/Error states
├── Skeleton.tsx            # Loading skeletons (Card/Table/List)
├── DetailDrawer.tsx        # Side panel drawer
└── index.ts                # Barrel exports
```

---

## 🎨 Patterns

### 1. **PageHeader**

Standard page header với title, subtitle, và actions slot.

**Dùng ở đâu:** Tất cả admin pages (Dashboard, Orders, Menu, Tables...)

**Example:**

```tsx
import { PageHeader } from "@/shared/patterns";

<PageHeader
  title="Dashboard"
  subtitle="Overview of your restaurant performance"
  actions={<Button>Export Data</Button>}
/>;
```

---

### 2. **FilterBar**

Reusable filter toolbar với search + custom filters slot.

**Dùng ở đâu:** Orders, Menu, Tables, Staff pages (bất kỳ list nào có filter)

**Example:**

```tsx
import { FilterBar } from "@/shared/patterns";

<FilterBar
  searchValue={search}
  searchPlaceholder="Search orders..."
  onSearchChange={setSearch}
  filters={
    <>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>All Status</option>
        <option>Pending</option>
      </select>
    </>
  }
  onClear={handleClearFilters}
/>;
```

---

### 3. **StatusPill**

Config-based status badge thay thế hard-coded Badge variants.

**Dùng ở đâu:** Orders, Tables, KDS - bất kỳ nơi nào cần hiển thị status

**Example:**

```tsx
import { StatusPill, ORDER_STATUS_CONFIG } from '@/shared/patterns';

// Dùng config có sẵn
<StatusPill {...ORDER_STATUS_CONFIG[order.status]} />

// Hoặc custom
<StatusPill label="Custom Status" tone="info" />
```

**Pre-built Configs:**

- `ORDER_STATUS_CONFIG` - placed, confirmed, preparing, ready, served, completed, cancelled
- `PAYMENT_STATUS_CONFIG` - paid, unpaid, refunded
- `TABLE_STATUS_CONFIG` - available, occupied, reserved, inactive

---

### 4. **EmptyState / ErrorState**

Standard empty và error UI cho lists, tables, search results.

**Dùng ở đâu:** Bất kỳ list nào có thể empty hoặc error

**Example:**

```tsx
import { EmptyState, ErrorState } from '@/shared/patterns';

// Empty state
<EmptyState
  icon={<ShoppingBag />}
  title="No orders yet"
  description="Orders will appear here when customers place them."
  action={{ label: 'View Menu', onClick: handleViewMenu }}
/>

// Error state
<ErrorState
  title="Failed to load orders"
  message="Please check your connection and try again."
  onRetry={refetch}
/>
```

---

### 5. **Skeleton (Loading States)**

Loading skeletons cho cards, tables, lists.

**Dùng ở đâu:** Bất kỳ nơi nào cần loading state thay vì spinner

**Example:**

```tsx
import { CardSkeleton, TableSkeleton, ListSkeleton } from "@/shared/patterns";

// Card grid loading
{
  isLoading ? <CardSkeleton count={6} /> : <MenuItemsGrid items={data} />;
}

// Table loading
{
  isLoading ? (
    <TableSkeleton rows={5} columns={6} />
  ) : (
    <OrdersTable orders={data} />
  );
}

// List loading
{
  isLoading ? <ListSkeleton count={8} /> : <OrdersList orders={data} />;
}
```

---

### 6. **DetailDrawer**

Side panel drawer cho viewing/editing details.

**Dùng ở đâu:** Order details, Menu item details, Staff details (alternative to Modal)

**Example:**

```tsx
import { DetailDrawer } from "@/shared/patterns";

<DetailDrawer
  isOpen={showOrderDetails}
  onClose={() => setShowOrderDetails(false)}
  title={`Order #${order.number}`}
  subtitle={`Table ${order.table}`}
  headerActions={<Button size="sm">Edit</Button>}
  footer={
    <>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
      <Button onClick={handleComplete}>Mark Complete</Button>
    </>
  }
>
  <OrderDetailsContent order={order} />
</DetailDrawer>;
```

---

## ✅ Usage Guidelines

### **Do:**

- ✅ Dùng patterns này cho consistency giữa các pages
- ✅ Dùng pre-built status configs (ORDER_STATUS_CONFIG, etc.)
- ✅ Pass custom content qua slots (filters, actions, footer)
- ✅ Extend patterns khi cần (wrap trong component mới)

### **Don't:**

- ❌ Hard-code lại status badge mapping trong components
- ❌ Tạo duplicate filter bars trong mỗi page
- ❌ Skip empty/error states (luôn handle edge cases)
- ❌ Dùng spinners thay vì skeleton loading states

---

## 🔧 Tech Stack

- **React** 19.2.3
- **TypeScript** strict mode
- **Tailwind CSS** v4 (utility classes)
- **Lucide Icons** (search, close, icons)
- **No external libraries** (patterns dùng primitive components có sẵn)

---

## 📝 Demo Integration

**Dashboard page** đã được update để demo:

- ✅ `PageHeader` thay thế hardcoded header
- ✅ `StatusPill` với `ORDER_STATUS_CONFIG` thay thế Badge if-else
- ✅ Không ảnh hưởng logic nghiệp vụ

**File changed:**

- `features/dashboard/components/DashboardPage.tsx` (~15 dòng thay đổi)

---

## 🚀 Next Steps

**Phase 2 - Scale Adoption:**

1. Orders page: FilterBar + StatusPill + DetailDrawer
2. Menu page: FilterBar + EmptyState + CardSkeleton
3. Tables page: StatusPill (table status) + TableSkeleton
4. Staff page: FilterBar + EmptyState

**Phase 3 - Advanced Patterns:**

- DataTable pattern (sort, pagination, selection)
- StatsCards pattern (KPI display)
- ConfirmDialog pattern (delete confirmations)

---

**Created:** 3/1/2026  
**Maintained by:** Web Team  
**Version:** 1.0
