// src/features/auth/role-edit/types/role-edit.types.ts

export type UpdateRoleRequest = {
  roleName: string;
  isActive: boolean;
  permissionIds: number[];
};

export type PermissionItemDto = {
  permissionId: number;
  screenCode: string;
  actionCode: string;
  displayName: string;
  isAssigned: boolean;
};

export type PermissionGroupDto = {
  screenCode: string;
  displayName: string;
  permissions: PermissionItemDto[];
};
