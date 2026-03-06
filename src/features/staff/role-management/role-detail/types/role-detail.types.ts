// src/features/auth/role-detail/types/role-detail.types.ts

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

export type RoleDetailDto = {
  roleId: number;
  roleCode: string;
  roleName: string;
  roleStatusLvId: number;
  isActive: boolean;
  permissionGroups: PermissionGroupDto[];
};
