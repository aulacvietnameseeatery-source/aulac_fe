# Permission Usage Guide

This document describes how to implement and use the permission-based access control system in the Aulac Frontend.

## 1. Core Policy: Hidden vs. Blurred

To balance security and discoverability, we use a hybrid UI policy:

1. **Sidebar Navigation**: Menu items are **HIDDEN** if the user lacks the required `READ` permission.
2. **In-Page Buttons (CRUD)**: Buttons like "Add", "Edit", or "Delete" are **BLURRED and DISABLED** instead of hidden. This allows users to see available features even if they don't have access yet.
3. **Internal URL Access**: Accessing a protected URL directly (e.g., `/dashboard/dish/create`) will **REDIRECT** to `/unauthorized`.

---

## 2. Implementation Methods

### Case 1: Hiding Sidebar Items
Currently implemented in `admin-sidebar.tsx`. Unauthorized items are filtered out.
- **Permission required**: Usually `FEATURE:READ`.

### Case 2: Blurring Action Buttons (In-Page)
Use `PermissionGuard` with `showDisabled={true}`.
```tsx
<PermissionGuard permission={Permissions.CreateDish} showDisabled={true}>
  <Button onClick={handleAdd}>Add New Dish</Button>
</PermissionGuard>
```
*   **Unauthorized state**: Opacity is reduced, grayscale and blur applied, and a tooltip shows "Bạn không có quyền thực hiện hành động này".

### Case 3: Row Actions in Tables
Controlled via the `permission` and `showDisabled` config in `TableActionColumn`.
```tsx
const actions = [
  {
    key: 'edit',
    icon: <Pencil />,
    permission: Permissions.EditDish,
    showDisabled: true, // IMPORTANT: Should be true for actions
    onClick: (item) => handleEdit(item)
  }
];
```

### Case 4: Protecting Routes (URL Access)
Wrap the entire page or layout with `ProtectedRoute`.
```tsx
// Inside src/app/[locale]/(auth)/dashboard/dish/create/page.tsx
export default function CreateDishPage() {
  return (
    <ProtectedRoute permission={Permissions.CreateDish}>
      <DishForm mode="create" />
    </ProtectedRoute>
  );
}
```
*   **Logic**: If unauthorized, the user is automatically redirected to `/unauthorized`.

### Case 5: Complex logic (Hook level)
Use `usePermissions` when you need to check multiple conditions in JS.
```tsx
const { can, canAny, canAll } = usePermissions();

if (can(Permissions.ProcessPayment)) {
  // logic...
}
```

---

## 3. Reference Table: Sidebar vs. Actions

| Feature | Sidebar Permission (Hidden) | Action Permissions (Blurred) |
|---------|---------------------------|----------------------------|
| Dishes | `DISH:READ` | `DISH:CREATE`, `DISH:EDIT`, `DISH:DELETE` |
| Roles | `ROLE:READ` | `ROLE:CREATE`, `ROLE:EDIT`, `ROLE:DELETE` |
| Orders | `ORDER:READ` | `ORDER:CREATE`, `ORDER:EDIT`, `ORDER:PROCESS_PAYMENT` |
| Inventory | `INVENTORY:READ` | `INVENTORY:UPDATE`, `INVENTORY:STOCK_CHECK` |

---

## 4. Frontend & Backend Synchronization

To ensure the permission system works correctly, the frontend constants **MUST** always match the backend definitions.

### Reference
- **Backend File**: `aulac_be/Core/Data/Permissions.cs`
- **Frontend File**: `src/types/const.ts`

### Synchronization Process
Whenever a new permission is added or an existing one is modified in the backend:
1.  Open `src/types/const.ts`.
2.  Add or update the key-value pair in the `Permissions` object.
3.  Ensure the **Value** string exactly matches the backend constant string (e.g., `'DISH:CREATE'`).
4.  Apply the new permission to the corresponding UI components using `PermissionGuard` or `ProtectedRoute`.

---

## 5. Implementation Rules Summary
1.  **Frontend permissions are for UX only**.
2.  Always use the `Permissions` object from `@/types/const.ts`.
3.  **NEVER** hide buttons in CRUD pages; always use the blur state.
4.  **ALWAYS** protect create/edit/management pages with `ProtectedRoute`.
