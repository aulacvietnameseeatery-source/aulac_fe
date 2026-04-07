"use client";

import React, { useState, useMemo } from "react";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { useAccountServiceErrors } from "../../hooks/useAccountActivity";

interface ServiceErrorsTabProps {
  accountId: number;
}

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "soft-secondary"> = {
  HIGH: "destructive",
  MEDIUM: "warning",
  LOW: "soft-secondary",
};

export const ServiceErrorsTab = ({ accountId }: ServiceErrorsTabProps) => {
  const t = useTranslations("Account.Detail");
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const query = useMemo(
    () => ({
      pageIndex: page,
      pageSize: 10,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, fromDate, toDate]
  );
  const { data, isLoading } = useAccountServiceErrors(accountId, query);

  const errors = useMemo(() => data?.pageData ?? [], [data]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return format.dateTime(new Date(d), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return "—";
    return format.number(amount, { style: "currency", currency: "VND" });
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {t("tabs.serviceErrors")}
          {data && <span className="ml-2 text-xs font-normal text-gray-400">({data.totalCount})</span>}
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] shrink-0">
        <ALDatePicker
          value={fromDate}
          onChange={(v) => { setFromDate(v); setPage(1); }}
          placeholder={t("activity.fromDate")}
          clearable
          displayFormat="dd/MM/yyyy"
        />
        <ALDatePicker
          value={toDate}
          onChange={(v) => { setToDate(v); setPage(1); }}
          placeholder={t("activity.toDate")}
          clearable
          displayFormat="dd/MM/yyyy"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFromDate("");
            setToDate("");
            setPage(1);
          }}
        >
          {t("activity.clearFilters")}
        </Button>
      </div>

      {isLoading ? (
        <div className="min-h-0 flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : errors.length === 0 ? (
        <div className="min-h-0 flex-1 flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
          <div>
            <AlertTriangle size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-medium">{t("activity.noServiceErrors")}</p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-2">
            {errors.map((err) => (
              <div
                key={err.errorId}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mt-0.5">
                  {err.isResolved ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={14} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={SEVERITY_VARIANT[err.severityName] ?? "soft-secondary"} className="text-[10px]">
                      {err.severityName}
                    </Badge>
                    <Badge variant="soft-secondary" className="text-[10px]">
                      {err.categoryName}
                    </Badge>
                    {err.isResolved && (
                      <Badge variant="success" className="text-[10px]">
                        {t("activity.resolved")}
                      </Badge>
                    )}
                    {err.orderId && (
                      <span className="text-xs text-gray-400">{t("activity.order")} #{err.orderId}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{err.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                    {err.penaltyAmount != null && err.penaltyAmount > 0 && (
                      <span className="text-red-500 font-medium">{t("activity.penalty")}: {formatCurrency(err.penaltyAmount)}</span>
                    )}
                    {err.isResolved && err.resolvedByName && (
                      <span>{t("activity.resolvedBy")}: {err.resolvedByName}</span>
                    )}
                    {err.isResolved && err.resolvedAt && (
                      <span>{formatDate(err.resolvedAt)}</span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(err.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination — always outside scroll area */}
      {!isLoading && data && data.totalPage > 1 && (
        <div className="shrink-0 border-t border-gray-100 pt-2 bg-white">
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t("activity.prev")}
            </Button>
            <span className="text-xs text-gray-500">
              {page} / {data.totalPage}
            </span>
            <Button variant="outline" size="sm" disabled={page >= data.totalPage} onClick={() => setPage((p) => p + 1)}>
              {t("activity.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
