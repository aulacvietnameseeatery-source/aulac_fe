"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Package } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import type { TableColumn } from "@/types/table.types";
import { Badge } from "@/components/ui/badge";
import { ALCard } from "@/components/ui/al-card";
import { TableActionColumn, type TableAction } from "@/components/ui/table/table-action-column";
import { useInventoryItemsQuery } from "../../hooks/use-inventory-queries";
import type { InventoryItemDto, GetInventoryItemsFilter } from "../../types/inventory.types";
import { LOOKUP_TYPE, useLookupCrud, LookupCombobox } from "@/features/lookup";
import { StockCardDrawer } from "./stock-card-drawer";

export function InventoryItemsList() {
  const t = useTranslations("inventory.items");

  const [filter, setFilter] = useState<GetInventoryItemsFilter>({
    pageIndex: 1,
    pageSize: 20,
  });

  const { data, isLoading, refetch } = useInventoryItemsQuery(filter);
  const items = useMemo(() => data?.pageData ?? [], [data]);

  const [stockCardItem, setStockCardItem] = useState<InventoryItemDto | null>(null);

  const categoryLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.InventoryCategory,
    queryKey: ["lookups", "inventory-category"],
    entityLabel: "Category",
  });

  const getItemActions = useCallback(
    (item: InventoryItemDto): TableAction<InventoryItemDto>[] => [
      {
        action: "history",
        onClick: () => setStockCardItem(item),
      },
    ],
    [],
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
        field: "ingredientName",
        header: t("table.item"),
        width: "280px",
        cellRender: ({ item }: { item: InventoryItemDto }) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FDFBF9] shrink-0 overflow-hidden border border-[#D5BA98]/40">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.ingredientName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#1A3A52]/30" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-[#1A3A52] truncate">{item.ingredientName}</span>
              <span className="text-xs text-[#1A3A52]/50">{item.unitName ?? "-"}</span>
            </div>
          </div>
        ),
      },
      {
        field: "categoryName",
        header: t("table.category"),
        width: "140px",
        cellRender: ({ item }: { item: InventoryItemDto }) => (
          <Badge variant="outline" className="border-[#D5BA98]/60 text-[#1A3A52]/70 bg-[#D5BA98]/10 font-normal">
            {item.categoryName ?? t("uncategorized")}
          </Badge>
        ),
      },
      {
        field: "typeName",
        header: t("table.type"),
        width: "130px",
        cellRender: ({ value }: { value: string | null }) => (
          <span className="text-sm text-[#1A3A52]/70">{value ?? "-"}</span>
        ),
      },
      {
        field: "quantityOnHand",
        header: t("table.stock"),
        width: "140px",
        align: "right" as const,
        cellRender: ({ item }: { item: InventoryItemDto }) => {
          const isLow = item.isLowStock;
          const isOut = item.quantityOnHand === 0 && item.minStockLevel > 0;
          return (
            <div className="flex flex-col items-end gap-0.5">
              <span className={`font-semibold text-sm ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}`}>
                {item.quantityOnHand}
                <span className="text-xs font-normal text-[#1A3A52]/40 ml-1">{item.unitName}</span>
              </span>
              {isLow && (
                <span className="flex items-center text-[10px] font-medium gap-0.5 text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  {isOut ? t("outOfStock") : t("lowStock")}
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: "minStockLevel",
        header: t("table.minLevel"),
        width: "100px",
        align: "right" as const,
        cellRender: ({ value }: { value: number }) => (
          <span className="text-sm text-[#1A3A52]/60">{value || "-"}</span>
        ),
      },
    ],
    [t],
  );

  return (
    <>
      <BaseTable<InventoryItemDto>
        data={items}
        loading={isLoading}
        columns={columns}
        rowKey="ingredientId"
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
              <div className="w-full sm:w-auto sm:min-w-60">
                <LookupCombobox
                  lookup={categoryLookup}
                  title={t("table.category")}
                  placeholder={t("table.category")}
                  inputSize="sm"
                  comboboxClassName="text-xs"
                  value={filter.categoryLvId ?? ""}
                  onChange={(val) =>
                    setFilter((f) => ({ ...f, categoryLvId: val === "" ? undefined : (val as number), pageIndex: 1 }))
                  }
                />
              </div>
            </div>
          </ALCard>
        )}
        renderActionColumn={(item: InventoryItemDto) => (
          <TableActionColumn item={item} actions={getItemActions(item)} />
        )}
      />

      {stockCardItem && (
        <StockCardDrawer
          item={stockCardItem}
          open={!!stockCardItem}
          onClose={() => setStockCardItem(null)}
        />
      )}
    </>
  );
}
