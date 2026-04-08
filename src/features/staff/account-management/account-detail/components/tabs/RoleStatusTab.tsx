"use client";

import React from "react";
import { Shield, Activity, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AccountDetail } from "../../types/account-detail.types";

interface RoleStatusTabProps {
  account: AccountDetail;
}

const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  INACTIVE: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  LOCKED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export const RoleStatusTab = ({ account }: RoleStatusTabProps) => {
  const t = useTranslations("Account.Detail.roleStatus");
  const tStatus = useTranslations("Account.Detail.statusLabel");
  const statusStyle = statusColorMap[account.accountStatus] || statusColorMap.INACTIVE;

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("title")}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Role */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
            <Shield size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("role")}</p>
            <span className="inline-block mt-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-bold border border-blue-100">
              {account.role.roleName}
            </span>
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Activity size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("status")}</p>
            <span
              className={`inline-block mt-1 px-2.5 py-1 rounded text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {tStatus(account.accountStatus as "ACTIVE" | "INACTIVE" | "LOCKED")}
            </span>
          </div>
        </div>

        {/* Is Locked */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <Lock size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("lockState")}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              {account.isLocked ? t("locked") : t("unlocked")}
            </p>
          </div>
        </div>

        {/* Permissions — only render if BE actually sends them */}
        {account.role.permissions && account.role.permissions.length > 0 ? (
          <div className="sm:col-span-2 flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Shield size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("permissions")}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {account.role.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs border border-indigo-100"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="sm:col-span-2 p-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              {t("permissionsNotAvailable")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
