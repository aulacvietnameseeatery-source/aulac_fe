"use client";

import React, { useState, useMemo } from "react";
import { Package, Loader2 } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountInventoryActivity } from "../../hooks/useAccountActivity";

interface InventoryTabProps {
  accountId: number;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "soft-secondary"> = {
  APPROVED: "success",
  PENDING_APPROVAL: "warning",
  DRAFT: "soft-secondary",
  REJECTED: "destructive",
};

export const InventoryTab = ({ accountId }: InventoryTabProps) => {
  const t = useTranslations("Account.Detail");
  const format = useFormatter();
  const [page, setPage] = useState(1);

  const query = useMemo(() => ({ pageIndex: page, pageSize: 10 }), [page]);
  const { data, isLoading } = useAccountInventoryActivity(accountId, query);

  const items = useMemo(() => data?.pageData ?? [], [data]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return format.dateTime(new Date(d), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("tabs.inventory")}
        {data && <span className="ml-2 text-xs font-normal text-gray-400">({data.totalCount})</span>}
      </h4>

      {items.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
          <Package size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400 font-medium">{t("activity.noInventory")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((tx) => (
              <div
                key={tx.transactionId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Package size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{tx.transactionCode ?? `#${tx.transactionId}`}</span>
                    <Badge variant={STATUS_VARIANT[tx.statusName] ?? "soft-secondary"} className="text-[10px]">
                      {tx.statusName}
                    </Badge>
                    <Badge variant="soft-secondary" className="text-[10px]">
                      {tx.typeName}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-400">
                    <span>{t("activity.role")}: {tx.staffRole}</span>
                    <span>{tx.itemCount} {t("activity.items")}</span>
                    {tx.note && <span className="truncate max-w-[200px]">{tx.note}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {data && data.totalPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
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
          )}
        </>
      )}
    </div>
  );
};
