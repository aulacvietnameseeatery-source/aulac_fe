# Permission Usage Guide (Admin Sidebar)

This document describes the permission mapping for the Admin Sidebar navigation items.

## Permission mapping

The sidebar uses the `can(permission)` hook to show/hide navigation items based on the user's roles and permissions.

### General Access (No permission required)
- `dashboard`: `/dashboard`
- `myShifts`: `/dashboard/my-shifts` (All staff can see their own shifts)

### Main Category
- **Orders**: `ORDER:READ`
- **Kitchen**: `ORDER:UPDATE_ITEM_STATUS`
- **Reservations**: `RESERVATION:READ`

### Management Category
- **Dish**: `DISH:READ`
- **Dish Category**: `DISH_CATEGORY:READ`
- **Promotions**: `PROMOTION:READ`
- **Coupons**: `COUPON:READ`
- **Tax Settings**: `SYSTEM_SETTING:READ`

### Warehouse Category
- **Ingredients**: `INVENTORY:READ`
- **Suppliers**: `SUPPLIER:READ`
- **Inventory**: `INVENTORY:READ`
- **Stock (Audit/Inventory Check)**: `INVENTORY:STOCK_CHECK`

### Operations Category
- **Tables**: `TABLE:READ`
- **Customers**: `CUSTOMER:READ`
- **Invoices**: `ORDER:READ`
- **Payments**: `ORDER:PROCESS_PAYMENT`

### Shifts Category
- **Shift Templates**: `SHIFT:MANAGE_TEMPLATE`
- **Shift Schedule**: `SHIFT:READ`
- **Live Shifts**: `SHIFT:READ`
- **Shift Reports**: `SHIFT:REPORT_READ`

### Administration Category
- **Staff**: `ACCOUNT:READ`
- **Roles**: `ROLE:READ`
- **Reports (General)**: `INVENTORY:REPORT_READ`

### Settings Category
- **Store Settings**: `SYSTEM_SETTING:READ`
- **System Settings**: `SYSTEM_SETTING:READ`
- **Emails**: `SYSTEM_SETTING:READ`

## Reference

Permissions are defined in `aulac_fe/src/types/const.ts`.
Sidebar logic is located in `aulac_fe/src/components/layout/admin-sidebar/admin-sidebar.tsx`.
