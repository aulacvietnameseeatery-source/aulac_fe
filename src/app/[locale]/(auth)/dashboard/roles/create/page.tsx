// src/app/[locale]/(auth)/dashboard/roles/create/page.tsx
"use client";

import { RoleCreateForm } from "@/features/auth/role-create";
import { useRoleCreate } from "@/features/auth/role-create";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const RoleCreatePage = () => {
  const t = useTranslations("Role.Create");
  const {
    roleCode,
    setRoleCode,
    roleName,
    setRoleName,
    isActive,
    setIsActive,
    permissionGroups,
    selectedPermissions,
    allPermissionsSelected,
    togglePermission,
    toggleGroupPermissions,
    toggleAllPermissions,
    isLoadingPermissions,
    isSubmitting,
    errors,
    handleSubmit,
    handleCancel
  } = useRoleCreate();

  const totalPermissions = permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <RoleCreateForm
        roleCode={roleCode}
        roleName={roleName}
        isActive={isActive}
        permissionGroups={permissionGroups}
        allPermissionsSelected={allPermissionsSelected}
        isLoadingPermissions={isLoadingPermissions}
        isSubmitting={isSubmitting}
        errors={errors}
        totalSelected={selectedPermissions.size}
        totalPermissions={totalPermissions}
        onRoleCodeChange={setRoleCode}
        onRoleNameChange={setRoleName}
        onIsActiveChange={setIsActive}
        onTogglePermission={togglePermission}
        onToggleGroup={toggleGroupPermissions}
        onToggleAll={toggleAllPermissions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default RoleCreatePage;
