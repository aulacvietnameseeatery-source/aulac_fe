# BaseTable Integration Guide

> **Purpose:** Standard reference for AI agents and developers to build new list pages using `BaseTable` with server-side search, pagination, and column filters.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│  Page Component (page.tsx)                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BaseTable                                           │  │
│  │  • Owns search input (debounced)                     │  │
│  │  • Owns pagination state (page, pageSize)            │  │
│  │  • Owns column filter state (FilterState per column) │  │
│  │  • Owns sort state                                   │  │
│  │                                                      │  │
│  │  Fires onDataChange({ search, filters, sort,         │  │
│  │                        page, pageSize })              │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                          │
│                 ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useXxxList hook (data-fetching)                     │  │
│  │  • Receives onDataChange params                      │  │
│  │  • Maps column filters → API params                  │  │
│  │  • Calls service, returns data + totalCount          │  │
│  │  • Provides refresh() for CRUD callbacks             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Dialogs / Modals (CRUD UI, managed by page state)         │
└────────────────────────────────────────────────────────────┘
```

**Key principle:** BaseTable is the **single source of truth** for search, pagination, and filter state. The hook is a **pure data-fetcher** that reacts to BaseTable's `onDataChange` callback.

---

## Step-by-Step: Adding a New List Page

### Step 1: Create the Data-Fetching Hook

Create a hook at `src/features/<domain>/hooks/use-xxx-list.ts`.

```typescript
// src/features/staff/example-management/hooks/use-example-list.ts
import { useState, useCallback, useRef } from "react";
import type { TableDataChangeParams } from "@/types/table-data-change.types";
import { exampleService } from "../services/example.service";
import type { ExampleDto } from "../types/example.types";

export const useExampleList = () => {
  // ---- State ----
  const [items, setItems] = useState<ExampleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Track page info for row numbering in the "#" column
  const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });

  // ---- Dedup + race-condition tracking ----
  const latestParamsRef = useRef<TableDataChangeParams>({});
  const lastFetchHashRef = useRef("");
  const fetchIdRef = useRef(0);

  // ---- onDataChange handler (passed to BaseTable) ----
  const handleDataChange = useCallback(async (params: TableDataChangeParams) => {
    // Dedup: skip if identical params
    const hash = JSON.stringify(params);
    if (hash === lastFetchHashRef.current) return;
    lastFetchHashRef.current = hash;
    latestParamsRef.current = params;

    // Race-condition guard
    const currentFetchId = ++fetchIdRef.current;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    setPaginationInfo({ page, pageSize });
    setIsLoading(true);

    try {
      // ---- Map column filters to API params ----
      // The key in params.filters matches the column `field` name.
      // For 'select' filters: value is the selected option's value string.
      // For 'text' filters: value is the typed text with an operator like 'contains'.
      const categoryId = params.filters?.["categoryName"]?.value
        ? Number(params.filters["categoryName"].value)
        : undefined;

      const res = await exampleService.getAll({
        pageIndex: page,
        pageSize,
        search: params.search || "",
        categoryId,
        // ... map other filters
      });

      // Only apply if this is still the latest request
      if (currentFetchId === fetchIdRef.current && res) {
        setItems(res.pageData);
        setTotalCount(res.totalCount);
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("Failed to fetch:", error);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // ---- refresh (call after CRUD operations) ----
  const refresh = useCallback(() => {
    lastFetchHashRef.current = ""; // reset dedup hash
    handleDataChange(latestParamsRef.current);
  }, [handleDataChange]);

  return {
    items,
    isLoading,
    totalCount,
    paginationInfo,
    onDataChange: handleDataChange,
    refresh,
  };
};
```

#### Hook Return Shape (always follow this interface)

| Field            | Type                                      | Purpose                                    |
|------------------|-------------------------------------------|--------------------------------------------|
| `items`          | `T[]`                                     | Current page data                          |
| `isLoading`      | `boolean`                                 | Loading state                              |
| `totalCount`     | `number`                                  | Total records (for pagination footer)      |
| `paginationInfo` | `{ page: number; pageSize: number }`      | Current page info (for row numbering)      |
| `onDataChange`   | `(params: TableDataChangeParams) => void` | Pass directly to `<BaseTable onDataChange>` |
| `refresh`        | `() => void`                              | Re-fetch with last params (post-CRUD)      |

#### Optional: Filter Options (for `select`-type column filters)

If your columns use `filterType: 'select'`, fetch the options on mount and return them:

```typescript
// Inside the hook
const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

useEffect(() => {
  myService.getStatuses().then(setStatusOptions);
}, []);

return {
  ...rest,
  filterOptions: { statuses: statusOptions },
};
```

---

### Step 2: Create the Page Component

Create the page at `src/app/[locale]/(auth)/dashboard/<entity>/page.tsx`.

```tsx
"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";

import { useExampleList } from "@/features/<domain>/hooks/use-example-list";
import type { ExampleDto } from "@/features/<domain>/types/example.types";
import { ExampleActions } from "@/features/<domain>/components/example-actions";

const ExampleListContent = () => {
  const t = useTranslations("Example.List");

  // 1. Data hook
  const { items, isLoading, totalCount, paginationInfo, onDataChange, refresh } =
    useExampleList();

  // 2. CRUD dialog state (your own)
  // ...

  // 3. Column definitions
  const columns: TableColumn[] = useMemo(() => [
    // See "Column Configuration" section below
  ], [paginationInfo.page, paginationInfo.pageSize, t /*, filterOptions */]);

  // 4. Global cell renderer (handles alignment)
  const handleGlobalRenderCell = useCallback(
    (field: string, value: any, item: ExampleDto, column: TableColumn, rowIndex: number) => {
      const content = column.cellRender
        ? column.cellRender({ value, item, column, rowIndex })
        : value;
      if (column.align) {
        return <div style={{ textAlign: column.align }}>{content}</div>;
      }
      return content;
    },
    []
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <BaseTable<ExampleDto>
        data={items}
        loading={isLoading}
        columns={columns}
        rowKey="exampleId"           // must match the unique ID field in your DTO
        total={totalCount}
        onDataChange={onDataChange}  // ← connects BaseTable to your hook
        onRefresh={refresh}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
            </div>
            <PermissionGuard permission={Permissions.CreateExample}>
              <Button onClick={handleCreate} variant="outline" className="shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                {t("addNew")}
              </Button>
            </PermissionGuard>
          </div>
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(item) => (
          <ExampleActions
            item={item}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}
      />

      {/* Dialogs / Modals here */}
    </div>
  );
};

export default function ExampleListPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewExample}>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        }
      >
        <ExampleListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
```

---

## Column Configuration Reference

### TableColumn Interface

```typescript
interface TableColumn {
  field: string;            // Maps to the DTO property name (e.g. "fullName")
  header: string;           // Display header text
  width?: string;           // e.g. "180px"
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;       // Default true — set false to disable sort menu
  filterType?: 'text' | 'number' | 'date' | 'select';  // Enables column filter
  filterOptions?: Array<{ label: string; value: any }>; // Required when filterType is 'select'
  cellRender?: (ctx: { value: any; item: any; column: TableColumn; rowIndex: number }) => ReactNode;
  backendField?: string;    // If the API field name differs from `field`
  valueTransformer?: (value: any) => any; // Transform filter value before sending
}
```

### Row Number Column (always first)

```typescript
{
  field: "id",
  header: t("table.no"),
  width: "80px",
  align: "center" as const,
  sortable: false,
  cellRender: ({ rowIndex }: { rowIndex: number }) =>
    (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
}
```

### Text Filter Column

Enables a popover where the user can filter with operators like "contains", "starts with", "equals", etc.

```typescript
{
  field: "fullName",
  header: t("table.fullName"),
  width: "180px",
  filterType: "text" as const,
}
```

In the hook, the filter value arrives as:
```typescript
params.filters?.["fullName"]  // { operator: "contains", value: "john", type: "text" }
```

### Select Filter Column (Dropdown)

Enables a dropdown popover with predefined options. The user picks one value.

```typescript
// In the page: build filter options from API data
const roleFilterOptions = useMemo(
  () => roles.map((r) => ({ label: r.roleName, value: String(r.roleId) })),
  [roles]
);

// In columns array:
{
  field: "roleName",
  header: t("table.role"),
  width: "110px",
  filterType: "select" as const,
  filterOptions: roleFilterOptions,  // ← must be { label, value }[]
}
```

In the hook, the filter value arrives as:
```typescript
params.filters?.["roleName"]  // { operator: "selected", value: "3", type: "select" }
// Map to API: roleId = Number(params.filters["roleName"].value)
```

> **Important:** The `value` is always a **string**. Convert with `Number()` if the API expects a number.

### Number Filter Column

```typescript
{
  field: "price",
  header: t("table.price"),
  width: "120px",
  align: "right" as const,
  filterType: "number" as const,
}
```

### Date Filter Column

```typescript
{
  field: "createdAt",
  header: t("table.createdAt"),
  width: "150px",
  filterType: "date" as const,
}
```

### Custom Cell Render

```typescript
{
  field: "statusName",
  header: t("table.status"),
  align: "center" as const,
  filterType: "select" as const,
  filterOptions: statusFilterOptions,
  cellRender: ({ value, item }: { value: any; item: any }) => (
    <Badge variant={item.statusId === 1 ? "success" : "secondary"}>
      {value}
    </Badge>
  ),
}
```

---

## Filter-to-API Mapping Cheat Sheet

The `params.filters` object is keyed by column `field` name. Each value is a `FilterState`:

```typescript
interface FilterState {
  operator: FilterOperator;  // 'contains' | 'equals' | 'selected' | 'greater' | ...
  value: string;             // Always a string
  type: FilterType;          // 'text' | 'number' | 'date' | 'select'
}
```

### Common patterns for extracting filter values in hooks:

```typescript
// Select filter → numeric API param
const roleId = params.filters?.["roleName"]?.value
  ? Number(params.filters["roleName"].value)
  : undefined;

// Select filter → string API param
const category = params.filters?.["categoryName"]?.value || undefined;

// Text filter → pass the value directly
const nameFilter = params.filters?.["fullName"]?.value || undefined;
```

---

## BaseTable Props Quick Reference

| Prop                 | Type                                        | Required | Description                                         |
|----------------------|---------------------------------------------|----------|-----------------------------------------------------|
| `data`               | `T[]`                                       | Yes      | Current page of items                               |
| `columns`            | `TableColumn[]`                             | Yes      | Column definitions                                  |
| `loading`            | `boolean`                                   | No       | Shows skeleton rows when true                       |
| `rowKey`             | `string`                                    | No       | Unique ID field name on T (default: `"id"`)         |
| `total`              | `number`                                    | No       | Total record count for pagination                   |
| `onDataChange`       | `(params) => void`                          | No       | **Main integration point** — fires on search/filter/page change |
| `onRefresh`          | `() => void`                                | No       | Called when user clicks the refresh button           |
| `searchPlaceholder`  | `string`                                    | No       | Placeholder for built-in search input               |
| `defaultRowsPerPage` | `number`                                    | No       | Initial page size (default: 10)                     |
| `rowsPerPageOptions` | `number[]`                                  | No       | Page size dropdown options                          |
| `renderTitle`        | `() => ReactNode`                           | No       | Page title + create button above the table          |
| `renderCell`         | `(field, value, item, column, idx) => Node` | No       | Global cell renderer (use for alignment)            |
| `renderActionColumn` | `(item, rowIndex) => ReactNode`             | No       | Actions column (view/edit/delete buttons)           |
| `renderToolbarAppend`| `(props) => ReactNode`                      | No       | Extra toolbar content (batch actions, etc.)         |
| `renderNoData`       | `() => ReactNode`                           | No       | Custom empty state                                  |
| `selectionMode`      | `'single' \| 'multiple'`                    | No       | Checkbox selection mode                             |
| `onSelectionChange`  | `(items: T[]) => void`                      | No       | Selection callback                                  |
| `batchActions`       | `BatchAction[]`                             | No       | Actions shown when rows are selected                |

---

## Existing Examples

| Page                | Hook File                                           | Page File                                               |
|---------------------|-----------------------------------------------------|---------------------------------------------------------|
| Staff Accounts      | `src/features/staff/account-management/account-list/hooks/useAccountList.ts` | `src/app/[locale]/(auth)/dashboard/staff/page.tsx`      |
| Roles               | `src/features/staff/role-list/hooks/useRoleList.ts`  | `src/app/[locale]/(auth)/dashboard/roles/page.tsx`      |
| Dishes              | `src/features/staff/dish-management/hooks/use-dish-list.ts` | `src/app/[locale]/(auth)/dashboard/dish/page.tsx` |

---

## Checklist for New Pages

- [ ] **Hook** implements `TableDataChangeParams` interface via `onDataChange`
- [ ] **Hook** returns `{ items, isLoading, totalCount, paginationInfo, onDataChange, refresh }`
- [ ] **Hook** uses `fetchIdRef` for race-condition protection
- [ ] **Hook** uses hash-based dedup to skip duplicate fetches
- [ ] **Hook** maps `params.filters[columnField].value` → API-specific param names
- [ ] **Page** passes `onDataChange` and `onRefresh={refresh}` to `<BaseTable>`
- [ ] **Page** passes `total={totalCount}` for correct pagination
- [ ] **Page** does NOT use a separate `<Pagination>` component (BaseTable handles it)
- [ ] **Page** does NOT use a separate Header component for search (BaseTable handles it)
- [ ] **Page** uses `renderTitle` for the page heading + create button
- [ ] **Columns** with filters have `filterType` set (`'text'`, `'number'`, `'date'`, or `'select'`)
- [ ] **Select columns** provide `filterOptions` as `{ label: string; value: string }[]`
- [ ] **Row number column** uses `paginationInfo.page` and `paginationInfo.pageSize`
- [ ] **Global `renderCell`** handles `column.align` via `<div style={{ textAlign }}>`
- [ ] **Dialogs** call `refresh()` on successful create/edit/delete

---

## Anti-Patterns (Do NOT Do)

| Bad Pattern | Correct Pattern |
|------------|-----------------|
| Managing search state in the page or a Header component | Let BaseTable manage it via `searchPlaceholder` prop |
| Separate `<Pagination>` component outside BaseTable | BaseTable has built-in `TablePagination` (via `total` prop) |
| URL-based pagination with `useSearchParams` / `router.push` | Let BaseTable manage page state internally, hook reacts to `onDataChange` |
| Fetching data in `useEffect` with filter/page dependencies | Fetch inside `onDataChange` callback (event-driven, not effect-driven) |
| Calling `onDataChange` from the page component | BaseTable calls it automatically on search/filter/page/sort changes |
