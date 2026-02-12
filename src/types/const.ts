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
} as const;