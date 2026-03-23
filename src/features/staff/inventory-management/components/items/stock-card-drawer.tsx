"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { ALCard } from "@/components/ui/al-card";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useStockCardQuery } from "../../hooks/use-inventory-queries";
import type { InventoryItemDto, StockCardDto } from "../../types/inventory.types";
import { InventoryTxTypeCode } from "@/types/status-codes";

interface Props {
  item: InventoryItemDto;
  open: boolean;
  onClose: () => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  [InventoryTxTypeCode.IN]: <ArrowDownCircle className="w-4 h-4 text-emerald-600" />,
  [InventoryTxTypeCode.OUT]: <ArrowUpCircle className="w-4 h-4 text-red-500" />,
  [InventoryTxTypeCode.ADJUST]: <RefreshCw className="w-4 h-4 text-blue-500" />,
};

export function StockCardDrawer({ item, open, onClose }: Props) {
  const t = useTranslations("inventory.stockCard");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<"7d" | "30d" | "all">("30d");
  const { data, isLoading } = useStockCardQuery(item.ingredientId, page, 20);
  const entries = useMemo(() => data?.pageData ?? [], [data]);
  const chartData = useMemo(() => {
    const now = new Date();
    const minDate =
      range === "all"
        ? null
        : new Date(now.getTime() - (range === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000);

    const filtered = entries.filter((entry) => {
      if (!entry.createdAt || !minDate) return true;
      return new Date(entry.createdAt) >= minDate;
    });

    const sorted = [...filtered].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });

    let runningNet = 0;

    return sorted.map((entry, idx) => {
      const qty = entry.quantityChanged ?? 0;
      runningNet += qty;

      return {
        label: entry.createdAt ? format(new Date(entry.createdAt), "dd/MM") : `#${idx + 1}`,
        inbound: qty > 0 ? qty : 0,
        outbound: qty < 0 ? Math.abs(qty) : 0,
        net: runningNet,
      };
    });
  }, [entries, range]);

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) onClose(); }} direction="right">
      <DrawerContent className="w-full md:w-[66.666vw] max-w-none">
        <DrawerHeader className="border-b border-[#D5BA98]/30 pb-4">
          <DrawerTitle className="text-lg font-semibold text-[#1A3A52] font-['Cormorant_Garamond']">
            {t("title")}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-[#1A3A52]/60">
            {item.ingredientName} — {item.quantityOnHand} {item.unitName}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF9]">
          <ALCard variant="default" padding="md" elevation="sm" radius="xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-[#1A3A52]/55">{t("table.unit")}</div>
                <div className="text-sm font-medium text-[#1A3A52]">{item.unitName ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-[#1A3A52]/55">{t("table.type")}</div>
                <div className="text-sm font-medium text-[#1A3A52]">{item.typeName ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-[#1A3A52]/55">{t("table.quantity")}</div>
                <div className="text-sm font-semibold text-[#1A3A52]">
                  {item.quantityOnHand} {item.unitName}
                </div>
              </div>
            </div>
          </ALCard>

          <ALCard variant="default" padding="md" elevation="sm" radius="xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1A3A52]">{t("movementChart")}</h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("inbound")}
                </span>
                <span className="inline-flex items-center gap-1 text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> {t("outbound")}
                </span>
                <span className="inline-flex items-center gap-1 text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> {t("net")}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg border border-[#D5BA98]/40 p-1 mb-3 bg-white">
              {([
                { key: "7d", label: t("range7d") },
                { key: "30d", label: t("range30d") },
                { key: "all", label: t("rangeAll") },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRange(opt.key)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    range === opt.key
                      ? "bg-[#1A3A52] text-white"
                      : "text-[#1A3A52]/65 hover:bg-[#D5BA98]/15"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {chartData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-[#1A3A52]/40">
                {t("noMovements")}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9dfd4" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#4f6172" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#4f6172" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e7d8c7",
                        backgroundColor: "#fffdfb",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="inbound" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outbound" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </ALCard>

          <ALCard variant="default" padding="md" elevation="sm" radius="xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-[#1A3A52]/40">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-[#1A3A52]/40 text-sm">
              {t("noMovements")}
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <StockCardEntry key={entry.transactionItemId} entry={entry} />
              ))}
            </div>
          )}

          {/* Simple pagination */}
          {data && data.totalPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-[#D5BA98]/20">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs rounded-md border border-[#D5BA98]/40 text-[#1A3A52]/70 hover:bg-[#D5BA98]/10 disabled:opacity-40"
              >
                {t("previous")}
              </button>
              <span className="text-xs text-[#1A3A52]/50">
                {page} / {data.totalPage}
              </span>
              <button
                disabled={page >= data.totalPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs rounded-md border border-[#D5BA98]/40 text-[#1A3A52]/70 hover:bg-[#D5BA98]/10 disabled:opacity-40"
              >
                {t("next")}
              </button>
            </div>
          )}
          </ALCard>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function StockCardEntry({ entry }: { entry: StockCardDto }) {
  const isIn = entry.typeCode === InventoryTxTypeCode.IN;
  const isOut = entry.typeCode === InventoryTxTypeCode.OUT;

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-[#D5BA98]/20 bg-white hover:bg-[#FDFBF9] transition-colors">
      <div className="mt-0.5">{TYPE_ICON[entry.typeCode ?? ""] ?? null}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-[#1A3A52]/50">{entry.transactionCode}</span>
          <span className="text-xs text-[#1A3A52]/40">
            {entry.createdAt ? format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm") : "-"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className={
              isIn
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : isOut
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
            }
          >
            {entry.typeName}
          </Badge>
          <span
            className={`text-sm font-semibold ${isIn ? "text-emerald-600" : isOut ? "text-red-600" : "text-blue-600"}`}
          >
            {entry.quantityChanged > 0 ? "+" : ""}
            {entry.quantityChanged} {entry.unitName}
          </span>
          {entry.unitPrice != null && (
            <span className="text-xs text-[#1A3A52]/40">
              @ {entry.unitPrice.toLocaleString()}
            </span>
          )}
        </div>
        {(entry.exportReasonName || entry.note) && (
          <div className="text-xs text-[#1A3A52]/50 mt-1">
            {entry.exportReasonName && <span className="mr-2">• {entry.exportReasonName}</span>}
            {entry.note && <span>— {entry.note}</span>}
          </div>
        )}
        {entry.createdByName && (
          <div className="text-[10px] text-[#1A3A52]/35 mt-0.5">by {entry.createdByName}</div>
        )}
      </div>
    </div>
  );
}
