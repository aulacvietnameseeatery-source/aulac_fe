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

  // Role
  ViewRole: 'ROLE:READ',
  CreateRole: 'ROLE:CREATE',
  UpdateRole: 'ROLE:UPDATE',
  DeleteRole: 'ROLE:DELETE',

  // Order
  ViewOrder: 'ORDER:READ',
  UpdateOrderItemStatus: 'ORDER:UPDATE_ITEM_STATUS',

  // Table
  ViewTable: 'TABLE:READ',
  CreateTable: 'TABLE:CREATE',
  EditTable: 'TABLE:EDIT',
  DeleteTable: 'TABLE:DELETE',
  UpdateTableStatus: 'TABLE:UPDATE_STATUS',

  // Promotion
  ViewPromotion: 'PROMOTION:READ',
  CreatePromotion: 'PROMOTION:CREATE',
  UpdatePromotion: 'PROMOTION:UPDATE',

  // Shift Management
  ViewShift: 'SHIFT:READ',
  ScheduleShift: 'SHIFT:SCHEDULE',
  AssignShift: 'SHIFT:ASSIGN',
  CheckInShift: 'SHIFT:CHECK_IN',
  CheckOutShift: 'SHIFT:CHECK_OUT',
  AdjustAttendance: 'SHIFT:ADJUST_ATTENDANCE',
  ViewShiftReport: 'SHIFT:REPORT_READ',
  CloseShift: 'SHIFT:CLOSE',
} as const;