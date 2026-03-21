export const Permissions = {
  // Account
  ViewAccount: 'ACCOUNT:READ',
  CreateAccount: 'ACCOUNT:CREATE',
  EditAccount: 'ACCOUNT:EDIT',
  UpdateAccount: 'ACCOUNT:UPDATE',
  DeleteAccount: 'ACCOUNT:DELETE',
  ResetPassword: 'ACCOUNT:RESET_PASSWORD',

  // System Settings
  ViewSystemSettings: 'SYSTEM_SETTING:READ',
  ManageSystemSettings: 'SYSTEM_SETTING:EDIT',

  // Dish
  ViewDish: 'DISH:READ',
  CreateDish: 'DISH:CREATE',
  EditDish: 'DISH:EDIT',
  DeleteDish: 'DISH:DELETE',

  // Dish Category
  ViewDishCategory: 'DISH_CATEGORY:READ',
  CreateDishCategory: 'DISH_CATEGORY:CREATE',
  EditDishCategory: 'DISH_CATEGORY:EDIT',
  DeleteDishCategory: 'DISH_CATEGORY:DELETE',

  // Supplier
  ViewSupplier: 'SUPPLIER:READ',
  CreateSupplier: 'SUPPLIER:CREATE',
  EditSupplier: 'SUPPLIER:EDIT',
  DeleteSupplier: 'SUPPLIER:DELETE',

  // Role
  ViewRole: 'ROLE:READ',
  CreateRole: 'ROLE:CREATE',
  UpdateRole: 'ROLE:UPDATE',
  DeleteRole: 'ROLE:DELETE',

  // Order
  ViewOrder: 'ORDER:READ',
  EditOrder: 'ORDER:EDIT',
  UpdateOrderItemStatus: 'ORDER:UPDATE_ITEM_STATUS',
  ProcessPayment: 'ORDER:PROCESS_PAYMENT',

  // Table
  ViewTable: 'TABLE:READ',
  CreateTable: 'TABLE:CREATE',
  EditTable: 'TABLE:EDIT',
  DeleteTable: 'TABLE:DELETE',
  UpdateTableStatus: 'TABLE:UPDATE_STATUS',
  ManageTableZone: 'TABLE:MANAGE_ZONE',
  ManageTableType: 'TABLE:MANAGE_TYPE',
  ManageTableMedia: 'TABLE:MANAGE_MEDIA',

  // Promotion
  ViewPromotion: 'PROMOTION:READ',
  CreatePromotion: 'PROMOTION:CREATE',
  UpdatePromotion: 'PROMOTION:UPDATE',

  // Coupon
  ViewCoupon: 'COUPON:READ',
  CreateCoupon: 'COUPON:CREATE',
  EditCoupon: 'COUPON:EDIT',
  DeleteCoupon: 'COUPON:DELETE',

  // Shift Management
  ViewShift: 'SHIFT:READ',
  ViewOwnShift: 'SHIFT:READ_OWN',
  ScheduleShift: 'SHIFT:SCHEDULE',
  AssignShift: 'SHIFT:ASSIGN',
  CheckInShift: 'SHIFT:CHECK_IN',
  CheckOutShift: 'SHIFT:CHECK_OUT',
  AdjustAttendance: 'SHIFT:ADJUST_ATTENDANCE',
  ViewShiftReport: 'SHIFT:REPORT_READ',
  CloseShift: 'SHIFT:CLOSE',
  ManageShiftTemplate: 'SHIFT:MANAGE_TEMPLATE',

  // Reservation
  ViewReservation: 'RESERVATION:READ',
  CreateReservation: 'RESERVATION:CREATE',
  UpdateReservation: 'RESERVATION:UPDATE',
  DeleteReservation: 'RESERVATION:DELETE',

  // Customer
  ViewCustomer: 'CUSTOMER:READ',
  CreateCustomer: 'CUSTOMER:CREATE',
  UpdateCustomer: 'CUSTOMER:UPDATE',
  DeleteCustomer: 'CUSTOMER:DELETE'
} as const;