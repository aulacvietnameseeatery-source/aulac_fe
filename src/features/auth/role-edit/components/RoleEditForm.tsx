// src/features/auth/role-edit/components/RoleEditForm.tsx
'use client';

import React from 'react';
import { PermissionGroupDto } from '../types/role-edit.types';
import { RoleEditHeader } from './RoleEditHeader';
import { RoleFormInputs } from './RoleFormInputs';
import { EditablePermissionsSection } from './EditablePermissionsSection';

type Props = {
  roleCode: string;
  roleName: string;
  permissionGroups: PermissionGroupDto[];
  allPermissionsSelected: boolean;
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

export const RoleEditForm = ({
  roleCode,
  roleName,
  permissionGroups,
  allPermissionsSelected,
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
      <RoleEditHeader
        isSubmitting={isSubmitting}
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
        isSubmitting={isSubmitting}
        onToggleAll={onToggleAll}
        onToggleGroup={onToggleGroup}
        onTogglePermission={onTogglePermission}
      />
    </div>
  );
};
