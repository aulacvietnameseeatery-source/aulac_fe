"use client";

import React, { useState, useMemo } from "react";
import { KeyRound, Clock, Monitor, Loader2 } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AccountDetail } from "../../types/account-detail.types";
import { useAccountLoginActivity } from "../../hooks/useAccountActivity";

interface SecurityTabProps {
  account: AccountDetail;
}

const EVENT_TYPE_VARIANT: Record<string, "default" | "soft-secondary" | "destructive" | "warning"> = {
  LOGIN: "default",
  LOGOUT: "soft-secondary",
  TOKEN_REFRESH: "warning",
  FORCE_LOGOUT: "destructive",
};

export const SecurityTab = ({ account }: SecurityTabProps) => {
  const t = useTranslations("Account.Detail.security");
  const tActivity = useTranslations("Account.Detail.activity");
  const format = useFormatter();
  const [page, setPage] = useState(1);

  const query = useMemo(() => ({ pageIndex: page, pageSize: 5 }), [page]);
  const { data, isLoading } = useAccountLoginActivity(account.accountId, query);
  const activities = useMemo(() => data?.pageData ?? [], [data]);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return t("never");
    return format.dateTime(new Date(dateStr), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatRelative(dateStr: string | null): string {
    if (!dateStr) return "";
    return format.relativeTime(new Date(dateStr));
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
            {account.lastLoginAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                {formatRelative(account.lastLoginAt)}
              </p>
            )}
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

      {/* Login Activity Section */}
      <div className="mt-6">
        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {t("loginActivity")}
          {data && <span className="ml-2 text-xs font-normal text-gray-400">({data.totalCount})</span>}
        </h5>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
            <Monitor size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{tActivity("noLoginActivity")}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {activities.map((a) => (
                <div
                  key={a.loginActivityId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Monitor size={14} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={EVENT_TYPE_VARIANT[a.eventType] ?? "soft-secondary"} className="text-[10px]">
                        {a.eventType}
                      </Badge>
                      {a.ipAddress && <span className="text-xs text-gray-400 font-mono">{a.ipAddress}</span>}
                    </div>
                    {a.deviceInfo && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{a.deviceInfo}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{formatDate(a.occurredAt)}</span>
                </div>
              ))}
            </div>

            {data && data.totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {tActivity("prev")}
                </Button>
                <span className="text-xs text-gray-500">
                  {page} / {data.totalPage}
                </span>
                <Button variant="outline" size="sm" disabled={page >= data.totalPage} onClick={() => setPage((p) => p + 1)}>
                  {tActivity("next")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
