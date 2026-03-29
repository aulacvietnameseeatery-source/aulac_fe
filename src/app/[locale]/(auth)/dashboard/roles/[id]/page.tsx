// src/app/[locale]/(auth)/dashboard/roles/[id]/page.tsx
'use client';

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoleDetail } from "@/features/staff/role-management/role-detail/hooks/useRoleDetail";
import { RoleDetailForm } from "@/features/staff/role-management/role-detail/components/RoleDetailForm";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

const RoleDetailContent = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Role.Detail");

  const roleId = Number(params.id);
  const { roleDetail, isLoading, error } = useRoleDetail(roleId);

  const handleBack = () => {
    router.push("/dashboard/roles");
  };

  const handleEdit = () => {
    router.push(`/dashboard/roles/${roleId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-gray-600" size={32} />
          <p className="text-gray-600 text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !roleDetail) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle className="text-red-500" size={48} />
          <h3 className="text-lg font-semibold text-gray-900">{t("errorTitle")}</h3>
          <p className="text-gray-600 text-sm">{error || t("errorMessage")}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t("backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Role Detail Form */}
      <RoleDetailForm
        roleDetail={roleDetail}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default function RoleDetailPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewRole}>
      <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
        <Suspense fallback={
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" size={32} />
          </div>
        }>
          <RoleDetailContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
