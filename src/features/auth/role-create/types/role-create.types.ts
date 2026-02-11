// src/features/auth/role-create/types/role-create.types.ts

export type CreateRoleRequest = {
  roleCode: string;
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

export type AllPermissionsDto = {
  permissionGroups: PermissionGroupDto[];
};
