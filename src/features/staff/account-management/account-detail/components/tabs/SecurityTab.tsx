"use client";

import React from "react";
import { KeyRound, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AccountDetail } from "../../types/account-detail.types";

interface SecurityTabProps {
  account: AccountDetail;
}

export const SecurityTab = ({ account }: SecurityTabProps) => {
  const t = useTranslations("Account.Detail.security");
  
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return t("never");
    return new Date(dateStr).toLocaleString();
  }

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("title")}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Last Login */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <KeyRound size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("lastLogin")}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              {formatDate(account.lastLoginAt)}
            </p>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("createdAt")}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(account.createdAt)}</p>
          </div>
        </div>

        {/* Updated At */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
            <Clock size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t("updatedAt")}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(account.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Auth Sessions Placeholder */}
      <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
        <p className="text-sm text-gray-400">
          {t("authSessionsPlaceholder")}
        </p>
      </div>
    </div>
  );
};
