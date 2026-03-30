"use client";

import React, { useState, useMemo } from "react";
import { ShoppingBag, Loader2, DollarSign, CreditCard } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountOrders } from "../../hooks/useAccountActivity";

interface OrdersTabProps {
  accountId: number;
}

const ORDER_STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "soft-secondary"> = {
  COMPLETED: "success",
  IN_PROGRESS: "warning",
  PENDING: "warning",
  CANCELLED: "destructive",
};

export const OrdersTab = ({ accountId }: OrdersTabProps) => {
  const t = useTranslations("Account.Detail");
  const format = useFormatter();
  const [page, setPage] = useState(1);

  const query = useMemo(() => ({ pageIndex: page, pageSize: 10 }), [page]);
  const { data, isLoading } = useAccountOrders(accountId, query);

  const orders = useMemo(() => data?.pageData ?? [], [data]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return format.dateTime(new Date(d), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (amount: number) => {
    return format.number(amount, { style: "currency", currency: "VND" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("tabs.orders")}
        {data && <span className="ml-2 text-xs font-normal text-gray-400">({data.totalCount})</span>}
      </h4>

      {orders.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
          <ShoppingBag size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400 font-medium">{t("activity.noOrders")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[44vh] overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors"
              >
                <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShoppingBag size={13} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">#{order.orderId}</span>
                    <Badge variant={ORDER_STATUS_VARIANT[order.orderStatus] ?? "soft-secondary"} className="text-[10px]">
                      {order.orderStatus}
                    </Badge>
                    {order.isPaid && (
                      <Badge variant="success" className="text-[10px]">
                        <CreditCard size={10} />
                        {t("activity.paid")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-400">
                    {order.tableCode && <span>{t("activity.table")}: {order.tableCode}</span>}
                    {order.customerName && <span>{order.customerName}</span>}
                    <span>{order.itemCount} {t("activity.items")}</span>
                    <span>{order.source}</span>
                  </div>
                </div>
                <div className="w-full pl-10 sm:pl-0 sm:w-auto shrink-0 text-left sm:text-right">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center justify-start sm:justify-end gap-1">
                    <DollarSign size={12} className="text-green-600" />
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPage > 1 && (
            <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("activity.prev")}
              </Button>
              <span className="text-xs text-gray-500">
                {page} / {data.totalPage}
              </span>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" disabled={page >= data.totalPage} onClick={() => setPage((p) => p + 1)}>
                {t("activity.next")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
