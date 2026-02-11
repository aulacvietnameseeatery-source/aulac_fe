// src/app/[locale]/(auth)/dashboard/roles/create/page.tsx
"use client";

import { RoleCreateForm } from "@/features/auth/role-create";
import { useRoleCreate } from "@/features/auth/role-create";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link 
          href="/dashboard/roles" 
          className="hover:text-gray-900 transition-colors"
        >
          {t("breadcrumb.roles")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{t("breadcrumb.create")}</span>
      </nav>

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
