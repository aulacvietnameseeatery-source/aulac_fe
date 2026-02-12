// src/features/auth/role-edit/components/RoleEditForm.tsx
'use client';

import React from 'react';
import { PermissionGroupDto } from '../types/role-edit.types';
import { RoleEditHeader } from './RoleEditHeader';
import { RoleFormInputs } from './RoleFormInputs';
import { RoleFormStatusToggle } from './RoleFormStatusToggle';
import { EditablePermissionsSection } from './EditablePermissionsSection';

type Props = {
  roleCode: string;
  roleName: string;
  isActive: boolean;
  permissionGroups: PermissionGroupDto[];
  allPermissionsSelected: boolean;
  isSubmitting: boolean;
  errors: {
    roleCode?: string;
    roleName?: string;
  };
  totalSelected: number;
  totalPermissions: number;
  onRoleCodeChange: (value: string) => void;
  onRoleNameChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
  onTogglePermission: (permissionId: number) => void;
  onToggleGroup: (group: PermissionGroupDto) => void;
  onToggleAll: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const RoleEditForm = ({
  roleCode,
  roleName,
  isActive,
  permissionGroups,
  allPermissionsSelected,
  isSubmitting,
  errors,
  totalSelected,
  totalPermissions,
  onRoleCodeChange,
  onRoleNameChange,
  onIsActiveChange,
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
        roleCode={roleCode}
        roleName={roleName}
        errors={errors}
        isSubmitting={isSubmitting}
        onRoleCodeChange={onRoleCodeChange}
        onRoleNameChange={onRoleNameChange}
      />
      
      <RoleFormStatusToggle
        isActive={isActive}
        isSubmitting={isSubmitting}
        onIsActiveChange={onIsActiveChange}
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
