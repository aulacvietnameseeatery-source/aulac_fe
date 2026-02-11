// src/app/[locale]/(auth)/dashboard/roles/[id]/edit/page.tsx
'use client';

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoleEdit } from "@/features/auth/role-edit/hooks/useRoleEdit";
import { RoleEditForm } from "@/features/auth/role-edit/components/RoleEditForm";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const RoleEditContent = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Role.Edit");
  
  const roleId = Number(params.id);
  
  const {
    roleCode,
    setRoleCode,
    roleName,
    setRoleName,
    isActive,
    setIsActive,
    permissionGroups,
    allPermissionsSelected,
    totalSelected,
    totalPermissions,
    isLoadingData,
    isSubmitting,
    errors,
    handleTogglePermission,
    handleToggleGroup,
    handleToggleAll,
    handleSubmit,
    handleCancel,
  } = useRoleEdit(roleId);

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-gray-600" size={32} />
          <p className="text-gray-600 text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => router.push("/dashboard/roles")}
            className="hover:text-gray-900 transition-colors"
          >
            {t("breadcrumb.roles")}
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/dashboard/roles/${roleId}`)}
            className="hover:text-gray-900 transition-colors"
          >
            {t("breadcrumb.detail")}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t("breadcrumb.edit")}</span>
        </nav>
      </div>

      {/* Role Edit Form */}
      <RoleEditForm
        roleCode={roleCode}
        roleName={roleName}
        isActive={isActive}
        permissionGroups={permissionGroups}
        allPermissionsSelected={allPermissionsSelected}
        isSubmitting={isSubmitting}
        errors={errors}
        totalSelected={totalSelected}
        totalPermissions={totalPermissions}
        onRoleCodeChange={setRoleCode}
        onRoleNameChange={setRoleName}
        onIsActiveChange={setIsActive}
        onTogglePermission={handleTogglePermission}
        onToggleGroup={handleToggleGroup}
        onToggleAll={handleToggleAll}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default function RoleEditPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans text-gray-900">
      <Suspense fallback={
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }>
        <RoleEditContent />
      </Suspense>
    </div>
  );
}
