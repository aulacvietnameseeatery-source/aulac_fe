"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useTranslations } from "next-intl";
import { Eye, CalendarDays, RefreshCw, X, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { useSaleInvoiceList } from '../hooks/useSaleInvoiceList';
import { SaleInvoiceListItem } from '../types/invoice.types';
import { dateUtils } from '@/lib/date-utils';
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";
import { InvoiceDetailDialog } from './InvoiceDetailDialog';

type DatePreset = "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "custom";

function SaleInvoiceListContent() {
  const t = useTranslations("orders.invoices.List");
  const { invoices, isLoading, totalCount, paginationInfo, onDataChange, refresh, latestParamsRef } = useSaleInvoiceList();

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Date filter state
  const [datePreset, setDatePreset] = useState<DatePreset | null>(null);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const DATE_PRESETS: { key: DatePreset; label: string }[] = useMemo(() => [
    { key: "today", label: t("dateRange.today") },
    { key: "yesterday", label: t("dateRange.yesterday") },
    { key: "last7", label: t("dateRange.last7") },
    { key: "last30", label: t("dateRange.last30") },
    { key: "thisMonth", label: t("dateRange.thisMonth") },
    { key: "lastMonth", label: t("dateRange.lastMonth") },
    { key: "custom", label: t("dateRange.custom") },
  ], [t]);

  const getPresetDates = (preset: DatePreset): { from: Date | null; to: Date | null } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eod = new Date();
    eod.setHours(23, 59, 59, 999);

    switch (preset) {
      case "today":
        return { from: today, to: eod };
      case "yesterday": {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const ye = new Date(y);
        ye.setHours(23, 59, 59, 999);
        return { from: y, to: ye };
      }
      case "last7": {
        const f = new Date(today);
        f.setDate(f.getDate() - 6);
        return { from: f, to: eod };
      }
      case "last30": {
        const f = new Date(today);
        f.setDate(f.getDate() - 29);
        return { from: f, to: eod };
      }
      case "thisMonth": {
        const f = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: f, to: eod };
      }
      case "lastMonth": {
        const f = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const t = new Date(today.getFullYear(), today.getMonth(), 0);
        t.setHours(23, 59, 59, 999);
        return { from: f, to: t };
      }
      default:
        return { from: null, to: null };
    }
  };

  const activeDateLabel = useMemo(() => {
    if (!datePreset) return null;
    if (datePreset !== "custom") return DATE_PRESETS.find(p => p.key === datePreset)?.label ?? null;
    if (customFrom && customTo) return `${customFrom} – ${customTo}`;
    if (customFrom) return `${t("dateRange.from")} ${customFrom}`;
    return t("dateRange.custom");
  }, [datePreset, customFrom, customTo, DATE_PRESETS, t]);

  const clearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDatePreset(null);
    setCustomFrom("");
    setCustomTo("");
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const handleViewDetails = (invoice: SaleInvoiceListItem) => {
    setSelectedOrderId(invoice.orderId);
    setDialogOpen(true);
  };

  // Refs for current date values — updated synchronously during render so handlers always see fresh values
  const fromDateRef = useRef<Date | undefined>(undefined);
  const toDateRef = useRef<Date | undefined>(undefined);
  const isFirstMountRef = useRef(true);

  // Compute date range from preset / custom inputs
  const currentFromDate = useMemo((): Date | undefined => {
    if (!datePreset) return undefined;
    if (datePreset !== "custom") {
      const { from } = getPresetDates(datePreset);
      return from ?? undefined;
    }
    return customFrom ? new Date(customFrom) : undefined;
  }, [datePreset, customFrom]);

  const currentToDate = useMemo((): Date | undefined => {
    if (!datePreset) return undefined;
    if (datePreset !== "custom") {
      const { to } = getPresetDates(datePreset);
      return to ?? undefined;
    }
    if (!customTo) return undefined;
    const d = new Date(customTo);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [datePreset, customTo]);

  // Keep refs in sync with computed values (runs every render, before effects)
  fromDateRef.current = currentFromDate;
  toDateRef.current = currentToDate;

  // Wrapper passed to BaseTable — always injects the current date range
  const handleDataChange = useCallback((params: Parameters<typeof onDataChange>[0]) => {
    onDataChange({ ...params, fromDate: fromDateRef.current, toDate: toDateRef.current });
  }, [onDataChange]);

  // Re-fetch when date filter changes; reset to page 1 but keep current search/sort
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    onDataChange({ ...latestParamsRef.current, page: 1, fromDate: fromDateRef.current, toDate: toDateRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datePreset, customFrom, customTo, onDataChange]);

  // Format currency without comma, CHF after number
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} CHF`;
  };

  // Format date — hiển thị theo giờ Thụy Sĩ
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return dateUtils.formatLocal(dateString, 'HH:mm dd/MM/yyyy');
  };

  // Table columns
  const columns: TableColumn[] = useMemo(() => [
    {
      field: 'no',
      header: t("table.no"),
      width: '60px',
      align: 'center',
      sortable: false,
      cellRender: ({ rowIndex }) =>
        (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
    },
    {
      field: 'invoiceCode',
      header: t("table.invoiceCode"),
      width: '120px',
      sortable: false,
    },
    {
      field: 'createdAt',
      header: t("table.createdAt"),
      width: '150px',
      sortable: false,
      cellRender: ({ value }) => formatDate(value),
    },
    {
      field: 'tableCode',
      header: t("table.tableCode"),
      width: '100px',
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'customerName',
      header: t("table.customerName"),
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'staffName',
      header: t("table.staffName"),
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'totalAmount',
      header: t("table.totalAmount"),
      width: '140px',
      align: 'right',
      sortable: false,
      cellRender: ({ value }) => formatCurrency(value),
    },
    {
      field: 'tipAmount',
      header: t("table.tipAmount"),
      width: '120px',
      align: 'right',
      sortable: false,
      cellRender: ({ value }) => formatCurrency(value),
    },
    {
      field: 'paymentMethod',
      header: t("table.paymentMethod"),
      width: '120px',
      align: 'center',
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'orderStatus',
      header: t("table.orderStatus"),
      width: '120px',
      sortable: false,
    },
  ], [paginationInfo.page, paginationInfo.pageSize, t]);

  const handleGlobalRenderCell = useCallback((value: any, item: SaleInvoiceListItem, column: TableColumn, rowIndex: number) => {
    const content = column.cellRender
      ? column.cellRender({ value, item, column, rowIndex })
      : value;

    if (column.align) {
      return <div style={{ textAlign: column.align }}>{content}</div>;
    }
    return content;
  }, []);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <InvoiceDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        orderId={selectedOrderId}
      />
      <BaseTable<SaleInvoiceListItem>
        data={invoices}
        loading={isLoading}
        columns={columns}
        rowKey="orderId"
        total={totalCount}
        onDataChange={handleDataChange}
        onRefresh={refresh}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderCell={handleGlobalRenderCell}
        renderTitle={() => (
          <div className="flex flex-col gap-3">
            <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#1A3A52] leading-none">
                  {t("title")}
                </h1>
                <p className="text-xs text-[#1A3A52]/60 mt-1">{t("description")}</p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="h-9 px-3.5 text-sm font-semibold bg-[#FDFBF9] border-[#D5BA98]/60 text-[#1A3A52] hover:bg-[#D5BA98]/10"
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t("refresh")}
              </Button>
            </div>

            {/* Date Filter */}
            <div className="flex gap-2">
              <div className="relative" ref={datePickerRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePickerOpen(!datePickerOpen)}
                  className={`h-9 px-3 text-sm font-medium ${activeDateLabel ? 'bg-[#1A3A52] text-white border-[#1A3A52]' : 'bg-white border-[#D5BA98]/60'
                    }`}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {activeDateLabel || t("dateRange.selectDate")}
                  {activeDateLabel && (
                    <X
                      className="ml-2 h-3 w-3"
                      onClick={clearDateFilter}
                    />
                  )}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>

                {datePickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#D5BA98]/30 rounded-md shadow-lg z-50 min-w-[200px]">
                    {DATE_PRESETS.map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => {
                          setDatePreset(preset.key);
                          if (preset.key !== 'custom') {
                            setDatePickerOpen(false);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#D5BA98]/10 ${datePreset === preset.key ? 'bg-[#D5BA98]/20 font-medium' : ''
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    {datePreset === 'custom' && (
                      <div className="p-3 border-t border-[#D5BA98]/30">
                        <label className="block text-xs mb-1">{t("dateRange.from")}</label>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="w-full border border-[#D5BA98]/30 rounded px-2 py-1 text-sm mb-2"
                        />
                        <label className="block text-xs mb-1">{t("dateRange.to")}</label>
                        <input
                          type="date"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full border border-[#D5BA98]/30 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        renderActionColumn={(item) => (
          <button
            className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1.5 rounded-md"
            data-tooltip-content={t("actions.viewDetails")}
            data-tooltip-id="my-tooltip"
            onClick={() => handleViewDetails(item)}
            title={t("actions.viewDetails")}
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      />
    </div>
  );
}

export default function SaleInvoiceListPage() {
  return (
    <ProtectedRoute permissions={[Permissions.ViewOrder]}>
      <SaleInvoiceListContent />
    </ProtectedRoute>
  );
}
