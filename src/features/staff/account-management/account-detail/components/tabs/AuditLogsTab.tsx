"use client";

import React, { useState, useMemo } from "react";
import { ScrollText, Loader2 } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountAuditLogs } from "../../hooks/useAccountActivity";

interface AuditLogsTabProps {
  accountId: number;
}

export const AuditLogsTab = ({ accountId }: AuditLogsTabProps) => {
  const t = useTranslations("Account.Detail");
  const format = useFormatter();
  const [page, setPage] = useState(1);

  const query = useMemo(() => ({ pageIndex: page, pageSize: 15 }), [page]);
  const { data, isLoading } = useAccountAuditLogs(accountId, query);

  const logs = useMemo(() => data?.pageData ?? [], [data]);

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
        {t("tabs.auditLogs")}
        {data && <span className="ml-2 text-xs font-normal text-gray-400">({data.totalCount})</span>}
      </h4>

      {logs.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
          <ScrollText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400 font-medium">{t("activity.noAuditLogs")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div
                key={log.logId}
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <ScrollText size={13} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="soft-secondary" className="text-[10px] font-mono">
                      {log.actionCode ?? "UNKNOWN"}
                    </Badge>
                    {log.targetTable && (
                      <span className="text-xs text-gray-500">
                        {log.targetTable}
                        {log.targetId != null && <span className="text-gray-400"> #{log.targetId}</span>}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(log.createdAt)}</span>
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
