// src/features/auth/role-detail/components/RoleDetailForm.tsx
'use client';

import React from 'react';
import { RoleDetailDto } from '../types/role-detail.types';
import { RoleDetailHeader } from './RoleDetailHeader';
import { RoleBasicInfo } from './RoleBasicInfo';
import { RoleStatusToggle } from './RoleStatusToggle';
import { PermissionsSection } from './PermissionsSection';

type Props = {
  roleDetail: RoleDetailDto;
  onBack: () => void;
  onEdit: () => void;
};

export const RoleDetailForm = ({ roleDetail, onBack, onEdit }: Props) => {
  return (
    <div className="bg-white">
      <RoleDetailHeader onBack={onBack} onEdit={onEdit} />
      
      <RoleBasicInfo 
        roleCode={roleDetail.roleCode} 
        roleName={roleDetail.roleName} 
      />
      
      <RoleStatusToggle isActive={roleDetail.isActive} />
      
      <PermissionsSection permissionGroups={roleDetail.permissionGroups} />
    </div>
  );
};
