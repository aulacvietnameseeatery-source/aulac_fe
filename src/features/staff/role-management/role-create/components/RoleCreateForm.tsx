// src/features/auth/role-create/components/RoleCreateForm.tsx
'use client';

import React from 'react';
import { PermissionGroupDto } from '../types/role-create.types';
import { RoleCreateHeader } from './RoleCreateHeader';
import { RoleFormInputs } from './RoleFormInputs';
import { EditablePermissionsSection } from './EditablePermissionsSection';

type Props = {
  roleName: string;
  permissionGroups: PermissionGroupDto[];
  allPermissionsSelected: boolean;
  isLoadingPermissions: boolean;
  isSubmitting: boolean;
  errors: {
    roleName?: string;
  };
  totalSelected: number;
  totalPermissions: number;
  onRoleNameChange: (value: string) => void;
  onTogglePermission: (permissionId: number) => void;
  onToggleGroup: (group: PermissionGroupDto) => void;
  onToggleAll: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const RoleCreateForm = ({
  roleName,
  permissionGroups,
  allPermissionsSelected,
  isLoadingPermissions,
  isSubmitting,
  errors,
  totalSelected,
  totalPermissions,
  onRoleNameChange,
  onTogglePermission,
  onToggleGroup,
  onToggleAll,
  onSubmit,
  onCancel
}: Props) => {
  return (
    <div className="bg-white">
      <RoleCreateHeader
        isSubmitting={isSubmitting}
        isLoadingPermissions={isLoadingPermissions}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
      
      <RoleFormInputs
        roleName={roleName}
        errors={errors}
        isSubmitting={isSubmitting}
        onRoleNameChange={onRoleNameChange}
      />
      
      <EditablePermissionsSection
        permissionGroups={permissionGroups}
        allPermissionsSelected={allPermissionsSelected}
        totalSelected={totalSelected}
        totalPermissions={totalPermissions}
        isLoadingPermissions={isLoadingPermissions}
        isSubmitting={isSubmitting}
        onToggleAll={onToggleAll}
        onToggleGroup={onToggleGroup}
        onTogglePermission={onTogglePermission}
      />
    </div>
  );
};
