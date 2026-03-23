"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import type { TableColumn } from "@/types/table.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import { TableActionColumn, type TableAction } from "@/components/ui/table/table-action-column";
import { useTransactionsQuery } from "../../hooks/use-inventory-queries";
import type {
  InventoryTransactionListDto,
  GetTransactionsFilter,
} from "../../types/inventory.types";
import { InventoryTxTypeCode, InventoryTxStatusCode } from "@/types/status-codes";

const STATUS_STYLE: Record<string, string> = {
  [InventoryTxStatusCode.DRAFT]: "bg-slate-100 text-slate-700 border-slate-200",
  [InventoryTxStatusCode.PENDING_APPROVAL]: "bg-amber-50 text-amber-700 border-amber-200",
  [InventoryTxStatusCode.COMPLETED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [InventoryTxStatusCode.CANCELLED]: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_STYLE: Record<string, string> = {
  [InventoryTxTypeCode.IN]: "bg-emerald-600 text-white",
  [InventoryTxTypeCode.OUT]: "bg-red-600 text-white",
  [InventoryTxTypeCode.ADJUST]: "bg-blue-600 text-white",
};

export function TransactionsList() {
  const t = useTranslations("inventory.transactions");
  const router = useRouter();

  const [filter, setFilter] = useState<GetTransactionsFilter>({
    pageIndex: 1,
    pageSize: 20,
  });

  const { data, isLoading, refetch } = useTransactionsQuery(filter);
  const transactions = useMemo(() => data?.pageData ?? [], [data]);

  const getTransactionActions = useCallback(
    (item: InventoryTransactionListDto): TableAction<InventoryTransactionListDto>[] => [
      {
        action: "view",
        onClick: () => router.push(`/dashboard/inventory/transactions/${item.transactionId}`),
      },
    ],
    [router],
  );

  const handleDataChange = useCallback(
    (params: { search?: string; page?: number; pageSize?: number }) => {
      setFilter((prev) => ({
        ...prev,
        search: params.search ?? prev.search,
        pageIndex: params.page ?? prev.pageIndex,
        pageSize: params.pageSize ?? prev.pageSize,
      }));
    },
    [],
  );

  const columns: TableColumn[] = useMemo(
    () => [
      {
        field: "transactionCode",
        header: t("table.code"),
        width: "140px",
        cellRender: ({ item }: { item: InventoryTransactionListDto }) => (
          <span className="font-mono text-sm text-[#1A3A52]/80">{item.transactionCode ?? "-"}</span>
        ),
      },
      {
        field: "typeCode",
        header: t("table.type"),
        width: "110px",
        cellRender: ({ item }: { item: InventoryTransactionListDto }) => (
          <Badge className={`text-[11px] font-medium ${TYPE_STYLE[item.typeCode ?? ""] ?? "bg-slate-500 text-white"}`}>
            {item.typeName ?? item.typeCode}
          </Badge>
        ),
      },
      {
        field: "statusCode",
        header: t("table.status"),
        width: "150px",
        cellRender: ({ item }: { item: InventoryTransactionListDto }) => (
          <Badge
            variant="outline"
            className={`text-[11px] font-medium ${STATUS_STYLE[item.statusCode ?? ""] ?? "bg-slate-100 text-slate-600"}`}
          >
            {item.statusName ?? item.statusCode}
          </Badge>
        ),
      },
      {
        field: "exportReasonName",
        header: t("table.reason"),
        width: "130px",
        cellRender: ({ value }: { value: string | null }) => (
          <span className="text-sm text-[#1A3A52]/60">{value ?? "-"}</span>
        ),
      },
      {
        field: "createdByName",
        header: t("table.createdBy"),
        width: "140px",
        cellRender: ({ item }: { item: InventoryTransactionListDto }) => (
          <div className="flex flex-col">
            <span className="text-sm text-[#1A3A52]/80">{item.createdByName ?? "-"}</span>
            <span className="text-[10px] text-[#1A3A52]/40">
              {item.createdAt ? format(new Date(item.createdAt), "dd/MM HH:mm") : ""}
            </span>
          </div>
        ),
      },
      {
        field: "itemCount",
        header: t("table.items"),
        width: "80px",
        align: "center" as const,
        cellRender: ({ value }: { value: number }) => (
          <span className="text-sm font-medium text-[#1A3A52]/70">{value}</span>
        ),
      },
      {
        field: "totalValue",
        header: t("table.totalValue"),
        width: "120px",
        align: "right" as const,
        cellRender: ({ value }: { value: number | null }) =>
          value != null ? (
            <span className="text-sm font-medium text-[#1A3A52]">{value.toLocaleString()}</span>
          ) : (
            <span className="text-sm text-[#1A3A52]/30">-</span>
          ),
      },
    ],
    [t],
  );

  return (
    <BaseTable<InventoryTransactionListDto>
      data={transactions}
      loading={isLoading}
      columns={columns}
      rowKey="transactionId"
      total={data?.totalCount ?? 0}
      onDataChange={handleDataChange}
      onRefresh={() => refetch()}
      searchPlaceholder={t("searchPlaceholder")}
      defaultRowsPerPage={20}
      rowsPerPageOptions={[10, 20, 50]}
      renderTitle={() => (
        <ALCard variant="default" padding="md" elevation="sm" radius="xl" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1A3A52] tracking-tight font-['Cormorant_Garamond']">
                {t("title")}
              </h1>
              <p className="text-sm text-[#1A3A52]/60 mt-0.5">{t("description")}</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/inventory/transactions/create")}
              className="bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("createNew")}
            </Button>
          </div>
        </ALCard>
      )}
      renderToolbarAppend={() => (
        <div className="flex items-center gap-2">
          {/* Type filter pills */}
          {[
            { label: t("types.IN"), code: InventoryTxTypeCode.IN, style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: t("types.OUT"), code: InventoryTxTypeCode.OUT, style: "bg-red-50 text-red-700 border-red-200" },
            { label: t("types.ADJUST"), code: InventoryTxTypeCode.ADJUST, style: "bg-blue-50 text-blue-700 border-blue-200" },
          ].map((pill) => {
            // We use typeCode string match for quick filter — the actual filter uses typeLvId
            // For simplicity we pass undefined when implementing filter by type pills
            // (This could be enhanced to use the actual LvIds from lookup)
            return null; // Placeholder — pills handled via BaseTable filters or dedicated filter bar
          })}
        </div>
      )}
      renderActionColumn={(item: InventoryTransactionListDto) => (
        <TableActionColumn item={item} actions={getTransactionActions(item)} />
      )}
    />
  );
}
