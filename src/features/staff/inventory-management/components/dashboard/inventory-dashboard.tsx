"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing"
import {
  Package,
  AlertTriangle,
  PackageX,
  Clock,
  ArrowRight,
} from "lucide-react";
import { dateUtils } from "@/lib/date-utils";
import { ALCard } from "@/components/ui/al-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TransactionDetailModal } from "../transactions/transaction-detail-modal";
import { useDashboardQuery } from "../../hooks/use-inventory-queries";
import type { LowStockItemDto, RecentTransactionDto } from "../../types/inventory.types";

const STAT_CARDS = [
  { key: "totalItems", icon: Package, color: "text-[#1A3A52]", bg: "bg-[#1A3A52]/5" },
  { key: "lowStock", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "outOfStock", icon: PackageX, color: "text-red-600", bg: "bg-red-50" },
  { key: "pendingTx", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
] as const;

export function InventoryDashboard() {
  const t = useTranslations("inventory.dashboard");
  const router = useRouter();
  const { data, isLoading } = useDashboardQuery();
  const [detailTxId, setDetailTxId] = React.useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-[#1A3A52]/40">{t("loading")}</div>
    );
  }

  const statValues: Record<string, number> = {
    totalItems: data.totalItems,
    lowStock: data.lowStockItems,
    outOfStock: data.outOfStockItems,
    pendingTx: data.pendingTransactions,
  };

  const stockHealthData = [
    { name: t("totalItems"), value: data.totalItems, fill: "#1A3A52" },
    { name: t("lowStock"), value: data.lowStockItems, fill: "#f59e0b" },
    { name: t("outOfStock"), value: data.outOfStockItems, fill: "#dc2626" },
  ];

  const txTypeMap = data.recentTransactions.reduce<Record<string, number>>((acc, tx) => {
    const key = tx.typeName ?? "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const txTypeData = Object.entries(txTypeMap).map(([name, value], idx) => ({
    name,
    value,
    fill: ["#059669", "#dc2626", "#2563eb", "#f59e0b", "#64748b"][idx % 5],
  }));

  return (
    <>
    <div className="space-y-6">
      <ALCard variant="default" padding="md" elevation="sm" radius="xl">
        <h1 className="text-2xl font-semibold text-[#1A3A52] tracking-tight font-['Cormorant_Garamond']">
          {t("title")}
        </h1>
        <p className="text-sm text-[#1A3A52]/60 mt-0.5">{t("description")}</p>
      </ALCard>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, icon: Icon, color, bg }) => (
          <ALCard key={key} variant="default" padding="md" elevation="sm" radius="xl">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A3A52]">{statValues[key]}</p>
                <p className="text-xs text-[#1A3A52]/50">{t(key)}</p>
              </div>
            </div>
          </ALCard>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Low Stock Items */}
        <ALCard variant="default" padding="none" elevation="sm" radius="xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5BA98]/20">
            <h2 className="text-base font-semibold text-[#1A3A52]">{t("lowStockItems")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/inventory/items")}
              className="text-[#1A3A52]/50 hover:text-[#1A3A52]"
            >
              {t("viewAll")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-[#D5BA98]/10">
            {data.lowStockList.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-[#1A3A52]/40">{t("noLowStock")}</div>
            ) : (
              data.lowStockList.slice(0, 8).map((item) => (
                <LowStockRow key={item.ingredientId} item={item} />
              ))
            )}
          </div>
        </ALCard>

        {/* Recent Transactions */}
        <ALCard variant="default" padding="none" elevation="sm" radius="xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5BA98]/20">
            <h2 className="text-base font-semibold text-[#1A3A52]">{t("recentTransactions")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/inventory/transactions")}
              className="text-[#1A3A52]/50 hover:text-[#1A3A52]"
            >
              {t("viewAll")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-[#D5BA98]/10">
            {data.recentTransactions.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-[#1A3A52]/40">{t("noRecentTx")}</div>
            ) : (
              data.recentTransactions.slice(0, 8).map((tx) => (
                <RecentTxRow key={tx.transactionId} tx={tx} onOpenDetail={setDetailTxId} />
              ))
            )}
          </div>
        </ALCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ALCard variant="default" padding="md" elevation="sm" radius="xl">
          <h3 className="text-sm font-semibold text-[#1A3A52] mb-3">{t("stockHealthChart")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockHealthData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4f6172" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#4f6172" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stockHealthData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ALCard>

        <ALCard variant="default" padding="md" elevation="sm" radius="xl">
          <h3 className="text-sm font-semibold text-[#1A3A52] mb-3">{t("txTypeChart")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={txTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={36} label>
                  {txTypeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ALCard>
      </div>
    </div>
    <TransactionDetailModal
      transactionId={detailTxId}
      open={detailTxId != null}
      onClose={() => setDetailTxId(null)}
    />
    </>
  );
}

function LowStockRow({ item }: { item: LowStockItemDto }) {
  const pct = item.minStockLevel > 0 ? (item.quantityOnHand / item.minStockLevel) * 100 : 0;
  const isOut = item.quantityOnHand === 0;

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-[#FDFBF9] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1A3A52] truncate">{item.ingredientName}</span>
          {item.categoryName && (
            <Badge variant="outline" className="text-[10px] border-[#D5BA98]/40 text-[#1A3A52]/50 shrink-0">
              {item.categoryName}
            </Badge>
          )}
        </div>
        {/* Stock bar */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-[#D5BA98]/15 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOut ? "bg-red-500" : pct < 50 ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs text-[#1A3A52]/50 shrink-0">
            {item.quantityOnHand} / {item.minStockLevel} {item.unitName}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecentTxRow({
  tx,
  onOpenDetail,
}: {
  tx: RecentTransactionDto;
  onOpenDetail: (transactionId: number) => void;
}) {
  const t = useTranslations("inventory.dashboard");
  return (
    <button
      onClick={() => onOpenDetail(tx.transactionId)}
      className="flex items-center gap-3 px-5 py-3 hover:bg-[#FDFBF9] transition-colors w-full text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-[#1A3A52]/70">{tx.transactionCode}</span>
          <Badge variant="outline" className="text-[10px]">
            {tx.typeName}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {tx.statusName}
          </Badge>
        </div>
        <div className="text-xs text-[#1A3A52]/40 mt-0.5">
          {tx.createdByName} · {t("itemCount", { count: tx.itemCount })}
          {tx.createdAt && ` · ${dateUtils.formatLocal(tx.createdAt, "dd/MM HH:mm")}`}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-[#1A3A52]/25 shrink-0" />
    </button>
  );
}
