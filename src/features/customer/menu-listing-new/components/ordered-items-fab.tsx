"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  X,
  ScrollText,
  Clock,
  CheckCircle2,
  ChefHat,
  XCircle,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/http";
import { ALConfirmDialog } from "@/components/ui/al-confirm-dialog";

// ─── Types ────────────────────────────────────────────────────────────────

type OrderItemStatus = "CREATED" | "IN_PROGRESS" | "READY" | "SERVED" | "REJECTED" | "CANCELLED";

interface OrderItemData {
  orderItemId: number;
  dishId: number;
  dishName: string;
  quantity: number;
  price: number;
  itemStatus: string;
  rejectReason?: string | null;
  note?: string | null;
}

interface CustomerOrderHistory {
  tableCode: string;
  totalItems: number;
  estimatedTotal: number;
  items: OrderItemData[];
}

// ─── Status configs ───────────────────────────────────────────────────────

const getItemStatusIcon = (status: string) => {
  const configs: Record<string, React.ElementType> = {
    CREATED: Clock,
    IN_PROGRESS: ChefHat,
    READY: CheckCircle2,
    SERVED: CheckCircle2,
    REJECTED: XCircle,
    CANCELLED: XCircle,
  };
  return configs[status] || Clock;
};

const getItemStatusStyles = (status: string) => {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    CREATED: {
      bg: "rgba(100,120,180,0.15)",
      text: "#8ba3e0",
      border: "rgba(100,120,180,0.35)",
    },
    IN_PROGRESS: {
      bg: "rgba(201,168,76,0.15)",
      text: "#e8c97a",
      border: "rgba(201,168,76,0.35)",
    },
    READY: {
      bg: "rgba(60,180,100,0.15)",
      text: "#5de0a0",
      border: "rgba(60,180,100,0.35)",
    },
    SERVED: {
      bg: "rgba(60,200,120,0.18)",
      text: "#4ade80",
      border: "rgba(60,200,120,0.4)",
    },
    REJECTED: {
      bg: "rgba(220,60,60,0.15)",
      text: "#f87171",
      border: "rgba(220,60,60,0.35)",
    },
    CANCELLED: {
      bg: "rgba(128,128,128,0.15)",
      text: "#9ca3af",
      border: "rgba(128,128,128,0.35)",
    },
  };
  return configs[status] || configs.CREATED;
};

// ─── API fetch ────────────────────────────────────────────────────────────
const CURRENT_ORDER_ID_KEY = "aulac_current_order_id";

interface ApiResponse<T> { data: T; }

async function fetchOrderByOrderId(orderId: number): Promise<CustomerOrderHistory> {
  const res = await api.get<ApiResponse<CustomerOrderHistory>>(`/api/orders/${orderId}/customer`);
  return res.data;
}

// ─── Component ────────────────────────────────────────────────────────────

export interface OrderHistoryFABProps {
  /** Table code from URL / sessionStorage, e.g. "T1" */
  tableCode?: string;
  /** Alias kept for backwards-compat */
  tableNumber?: string;
  /** dishId → localized name, used to override the backend's stored DB name */
  dishNameMap?: Record<number, string>;
  /** Increment this value to trigger a silent background refresh of the badge count */
  refreshTrigger?: number;
  /** When true, forces the popup to close (used when other popup opens) */
  forceClose?: boolean;
  /** Callback when popup open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** When true, forces the popup to open (used after order success) */
  forceOpen?: boolean;
}

export function OrderHistoryFAB({ tableCode, tableNumber, dishNameMap = {}, refreshTrigger = 0, forceClose = false, forceOpen = false, onOpenChange }: OrderHistoryFABProps) {
  const t = useTranslations("OrderHistory");
  const router = useRouter();
  const effectiveTable = tableCode || tableNumber || "";
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [history, setHistory] = useState<CustomerOrderHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingItems, setCancellingItems] = useState<Set<number>>(new Set());
  const [cancelConfirmItemId, setCancelConfirmItemId] = useState<number | null>(null);

  // Derive the dish name of the item pending cancel confirmation
  const cancelConfirmItemDishName = cancelConfirmItemId !== null
    ? (() => {
        const item = history?.items.find(i => i.orderItemId === cancelConfirmItemId);
        if (!item) return "";
        return dishNameMap[item.dishId] || item.dishName;
      })()
    : "";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear all order-related data from session storage
  const clearAllOrderData = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
      sessionStorage.removeItem('aulac_table_number');

      sessionStorage.removeItem('aulac_cart_items');
    }
  }, []);

  // Handle payment completion - clear data and redirect
  const handlePaymentComplete = useCallback(() => {
    setIsSuccessPopupOpen(false);
    clearAllOrderData();
    // Hard reload to reset all states and force table selection
    if (typeof window !== 'undefined') {
      window.location.href = '/menu-listing';
    }
  }, [clearAllOrderData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to get translated status label
  const getStatusLabel = (status: string): string => {
    const statusKey = status.toUpperCase();
    const statusMap: Record<string, string> = {
      'CREATED': 'created',
      'IN_PROGRESS': 'inProgress',
      'READY': 'ready',
      'SERVED': 'served',
      'REJECTED': 'rejected',
      'CANCELLED': 'cancelled',
    };
    const key = statusMap[statusKey] || 'created';
    return t(`status.${key}`);
  };

  // ── fetch + auto-refresh every 15 s while panel is open ───────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Only fetch by current session's orderId – never fall back to table-wide history
      const storedOrderId = typeof window !== 'undefined'
        ? sessionStorage.getItem(CURRENT_ORDER_ID_KEY)
        : null;

      if (storedOrderId) {
        const data = await fetchOrderByOrderId(Number(storedOrderId));
        setHistory(data);
      } else {
        // No active order this session – show empty state
        setHistory(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cancel order item ─────────────────────────────────────────────────
  const handleCancelItem = useCallback(async (orderItemId: number) => {
    setCancellingItems(prev => new Set(prev).add(orderItemId));
    try {
      await api.patch(`/api/orders/items/${orderItemId}/cancel`, {});
      // Refresh the order history after successful cancellation
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cancelError"));
    } finally {
      setCancellingItems(prev => {
        const next = new Set(prev);
        next.delete(orderItemId);
        return next;
      });
    }
  }, [load, t]);

  useEffect(() => {
    const hasSession = typeof window !== 'undefined' && !!sessionStorage.getItem(CURRENT_ORDER_ID_KEY);
    if (isOpen && (effectiveTable || hasSession)) {
      load();
      intervalRef.current = setInterval(load, 15_000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, effectiveTable, load]);

  // Silent background refresh when an order is confirmed (panel may be closed)
  useEffect(() => {
    if (refreshTrigger <= 0) return;
    const storedOrderId = typeof window !== 'undefined'
      ? sessionStorage.getItem(CURRENT_ORDER_ID_KEY)
      : null;
    if (!storedOrderId) return;
    // Fetch silently – no loading spinner, don't disrupt open panel's state
    fetchOrderByOrderId(Number(storedOrderId))
      .then((data) => setHistory(data))
      .catch(() => { /* ignore silent errors */ });
  }, [refreshTrigger]);

  // All items from history
  const allItems: OrderItemData[] = history?.items ?? [];
  const totalItems = history?.totalItems ?? 0;
  const estimatedTotal = history?.estimatedTotal ?? 0;

  // Listen to forceClose prop to close popup when other popup opens
  useEffect(() => {
    if (forceClose && isOpen) {
      setIsOpen(false);
    }
  }, [forceClose, isOpen]);

  // Listen to forceOpen prop to open popup programmatically
  useEffect(() => {
    if (forceOpen && !isOpen) {
      setIsOpen(true);
      onOpenChange?.(true);
    }
  }, [forceOpen]);

  return (
    <>
      {/* ── Backdrop (only when expanded) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              onOpenChange?.(false);
            }}
            className="fixed inset-0 z-[89] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Morphing container: FAB ↔ Panel ── */}
      <div className={cn(
        "flex flex-col items-center",
        isOpen ? "contents" : "gap-[3px]"
      )}>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            layout: { type: "spring", stiffness: 200, damping: 28 },
            opacity: { duration: 0.2 },
            scale: { type: "spring", stiffness: 300, damping: 25 },
          }}
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              onOpenChange?.(true);
            }
          }}
          className={cn(
            "transition-[border-radius,box-shadow] duration-300",
            isOpen
              ? "w-[92vw] md:w-[500px] h-[82vh] md:h-[640px] md:max-h-[calc(100vh-160px)] rounded-[28px] fixed top-[calc(50%+20px)] md:top-[calc(50%+50px)] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] cursor-default flex flex-col overflow-hidden"
              : "relative w-[68px] h-[68px] rounded-full cursor-pointer flex items-center justify-center overflow-visible"
          )}
          style={{
            background: isOpen
              ? "linear-gradient(170deg, #192848 0%, #0f1f3d 100%)"
              : "#204560",
            border: isOpen
              ? "1px solid rgba(201,168,76,0.35)"
              : "2px solid #c9a84c",
            boxShadow: isOpen
              ? "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)"
              : "0 4px 20px rgba(0,0,0,0.55)",
          }}
          aria-label={t("fabAriaLabel")}
        >
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* ── Collapsed FAB content ── */
              <motion.div
                key="fab-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="flex items-center justify-center w-full h-full relative"
              >
                <ScrollText size={30} strokeWidth={1.6} className="text-[#e8c97a] drop-shadow-sm" />

                {/* Badge: total item count */}
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-bold text-[#0f1f3d] leading-none"
                    style={{
                      background: "linear-gradient(135deg, #f5d77a, #c9a84c)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.div>
            ) : (
              /* ── Expanded panel content ── */
            <motion.div
              key="panel-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex flex-col w-full h-full"
            >
              {/* ── Header ── */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: "rgba(201,168,76,0.25)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)" }}
                  >
                    <ScrollText size={18} strokeWidth={1.6} className="text-[#e8c97a]" />
                  </div>
                  <div>
                    <h3 className="text-[#e8c97a] font-bold text-base tracking-wide">{t("title")}</h3>
                    <p className="text-[#8ba3c7] text-xs">
                      {effectiveTable && (
                        <>{t("tableLabel")} <span className="text-[#c9a84c] font-semibold">{effectiveTable}</span> · </>
                      )}
                      {t("itemsCount", { count: totalItems })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={load}
                    disabled={loading}
                    className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    aria-label={t("refreshAriaLabel")}
                  >
                    <RefreshCw size={14} className={`text-[#8ba3c7] ${loading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenChange?.(false);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    aria-label={t("closeAriaLabel")}
                  >
                    <X size={16} className="text-[#8ba3c7]" />
                  </button>
                </div>
              </div>

              {/* ── Body (scrollable) ── */}
              <div className="overflow-y-auto flex-1 px-4 py-3">
                {/* Error */}
                {error && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
                    style={{
                      background: "rgba(220,60,60,0.12)",
                      border: "1px solid rgba(220,60,60,0.3)",
                      color: "#f87171",
                    }}
                  >
                    <AlertTriangle size={13} strokeWidth={2} />
                    {error}
                  </div>
                )}

                {/* Column headers */}
                {allItems.length > 0 && (
                  <div
                    className="grid gap-x-2 px-2 pb-3 text-xs font-bold tracking-widest uppercase"
                    style={{ gridTemplateColumns: "1fr 32px 68px 90px", color: "rgba(139,163,199,0.7)", background: "transparent" }}
                  >
                    <span>{t("headers.dish")}</span>
                    <span className="text-center">{t("headers.quantity")}</span>
                    <span className="text-right">{t("headers.price")}</span>
                    <span className="text-right">{t("headers.status")}</span>
                  </div>
                )}

                {/* Empty state */}
                {allItems.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.08)", border: "1px dashed rgba(201,168,76,0.3)" }}
                    >
                      <ScrollText size={36} strokeWidth={1.2} className="text-[#c9a84c] opacity-40" />
                    </div>
                    <p className="text-[#6b84a8] text-sm text-center leading-relaxed">
                      {t("emptyState.title")}
                      <br />
                      {t("emptyState.subtitle")}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {allItems.map((item, idx) => {
                      const statusKey = item.itemStatus.toUpperCase() as OrderItemStatus;
                      const Icon = getItemStatusIcon(statusKey);
                      const styles = getItemStatusStyles(statusKey);
                      const statusLabel = getStatusLabel(statusKey);
                      const isRejected = statusKey === "REJECTED";
                      const isCancelled = statusKey === "CANCELLED";
                      const canCancel = statusKey === "CREATED";
                      const isCancelling = cancellingItems.has(item.orderItemId);

                      const localizedName = dishNameMap[item.dishId] || item.dishName;

                      return (
                        <div key={`${item.orderItemId}-${idx}`}>
                          <div
                            className="grid items-start gap-x-2 rounded-xl px-2 py-2"
                            style={{
                              gridTemplateColumns: "1fr 32px 68px 90px",
                              background: isRejected || isCancelled ? "rgba(220,60,60,0.06)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isRejected || isCancelled ? "rgba(220,60,60,0.2)" : "rgba(201,168,76,0.12)"}`,
                            }}
                          >
                            {/* Name + note */}
                            <div className="min-w-0">
                              <p className={`text-[13px] font-semibold leading-snug truncate ${isRejected || isCancelled ? "line-through text-[#6b84a8]" : "text-[#e8d9b0]"}`}>
                                {localizedName}
                              </p>
                              {item.note && (
                                <p className="text-[#6b84a8] text-[10px] italic truncate mt-0.5">{item.note}</p>
                              )}
                            </div>
                            {/* Qty */}
                            <p className="text-[#8ba3c7] text-xs text-center leading-tight pt-0.5">{item.quantity}×</p>
                            {/* Price */}
                            <p className="text-[#c9a84c] text-xs text-right font-medium leading-tight pt-0.5">
                              {(item.price * item.quantity).toLocaleString("vi-VN")}
                            </p>
                            {/* Status badge */}
                            <div
                              className="flex items-center justify-end gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold self-start"
                              style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text }}
                            >
                              <Icon size={10} strokeWidth={2} />
                              <span>{statusLabel}</span>
                            </div>
                          </div>

                          {/* Cancel button for CREATED items */}
                          {canCancel && (
                            <div className="mt-1 mx-0.5 flex justify-end">
                              <button
                                onClick={() => setCancelConfirmItemId(item.orderItemId)}
                                disabled={isCancelling}
                                className="px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: "rgba(220,60,60,0.12)",
                                  border: "1px solid rgba(220,60,60,0.3)",
                                  color: "#f87171",
                                }}
                              >
                                {isCancelling ? t("cancelling") : t("cancelItem")}
                              </button>
                            </div>
                          )}

                          {/* Chef note for rejected items */}
                          {isRejected && item.rejectReason && (
                            <div
                              className="mt-1 mx-0.5 px-3 py-2 rounded-xl text-[11px] leading-relaxed"
                              style={{
                                background: "rgba(255,120,80,0.08)",
                                border: "1px solid rgba(255,120,80,0.25)",
                                color: "#fca5a5",
                              }}
                            >
                              <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: "#f87171" }}>
                                {t("chefNote")}
                              </span>
                              <br />
                              <span className="italic">&ldquo;{item.rejectReason}&rdquo;</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              {allItems.length > 0 && (
                <div
                  className="flex-shrink-0 border-t px-5 py-4 flex flex-col gap-3"
                  style={{ borderColor: "rgba(201,168,76,0.25)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(139,163,199,0.7)" }}>
                      {t("estimatedTotal")}
                    </span>
                    <span className="text-[#e8c97a] text-xl font-bold">
                      {estimatedTotal.toLocaleString("vi-VN")}{" "}
                      <span className="text-sm font-semibold">CHF</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setIsPaymentPopupOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-opacity active:opacity-80"
                    style={{
                      background: "linear-gradient(135deg, #f5d77a, #c9a84c)",
                      color: "#0f1f3d",
                      boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
                    }}
                  >
                    <CreditCard size={16} strokeWidth={2} />
                    {t("requestPayment")}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Label below the circle (only when collapsed) */}
      {!isOpen && (
        <span
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "#c9a84c", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
        >
          {t("fabLabel")}
        </span>
      )}
      </div>

      {/* ── Cancel Item Confirmation Popup ── */}
      <ALConfirmDialog
        isOpen={cancelConfirmItemId !== null}
        onClose={() => setCancelConfirmItemId(null)}
        onConfirm={() => {
          const itemId = cancelConfirmItemId;
          setCancelConfirmItemId(null);
          if (itemId !== null) handleCancelItem(itemId);
        }}
        variant="warning"
        title={t("cancelPopup.title")}
        message={t("cancelPopup.message", { dishName: cancelConfirmItemDishName })}
        confirmText={t("cancelPopup.yes")}
        cancelText={t("cancelPopup.no")}
        confirmButtonVariant="danger"
      />

      {/* ── Payment Confirmation Popup ── */}
      <AnimatePresence>
        {isPaymentPopupOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="payment-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentPopupOpen(false)}
              className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
            />

            {/* Payment Dialog */}
            <motion.div
              key="payment-dialog"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[96] w-[85vw] max-w-[320px] rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(170deg, #f8f9fb 0%, #ffffff 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsPaymentPopupOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                aria-label={t("paymentPopup.closeAriaLabel")}
              >
                <X size={18} className="text-gray-600" />
              </button>

              <div className="px-6 py-8 flex flex-col items-center text-center">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: "linear-gradient(135deg, #3b4d6b, #2a3f5f)",
                    boxShadow: "0 8px 20px rgba(59,77,107,0.3)",
                  }}
                >
                  <CreditCard size={32} strokeWidth={2} className="text-[#e8c97a]" />
                </div>

                {/* Title */}
                <h3 className="text-[#2a3f5f] font-bold text-xl mb-3 tracking-tight">
                  {t("paymentPopup.title")}
                </h3>

                {/* Message */}
                <p className="text-[#6b7b92] text-sm leading-relaxed mb-6 max-w-[280px]">
                  {t("paymentPopup.message", {
                    tableLabel: t("tableLabel").toLowerCase(),
                    tableNumber: effectiveTable,
                  })}
                </p>

                {/* Estimated Total */}
                <div
                  className="w-full rounded-2xl px-5 py-4 mb-5"
                  style={{
                    background: "linear-gradient(135deg, #f5f7fa, #e8edf5)",
                    border: "1px solid rgba(107,123,146,0.15)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7b92] text-xs font-semibold uppercase tracking-widest">
                      {t("paymentPopup.estimatedTotalLabel")}
                    </span>
                    <span className="text-[#2a3f5f] text-2xl font-bold">
                      ${estimatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => {
                    // TODO: Implement payment request API call
                    setIsPaymentPopupOpen(false);
                    setIsSuccessPopupOpen(true);
                    
                    // After 3 seconds, complete payment process
                    redirectTimeoutRef.current = setTimeout(() => {
                      handlePaymentComplete();
                    }, 3000);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all hover:shadow-lg active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #f5d77a, #c9a84c)",
                    color: "#2a3f5f",
                    boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
                  }}
                >
                  {t("paymentPopup.confirm")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Success Popup ── */}
      <AnimatePresence>
        {isSuccessPopupOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="success-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[98] bg-black/70 backdrop-blur-sm"
            />

            {/* Success Dialog */}
            <motion.div
              key="success-dialog"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99] w-[85vw] max-w-[340px] rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(170deg, #f8f9fb 0%, #ffffff 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >              {/* Close button */}
              <button
                onClick={() => {
                  // Cancel the auto-redirect timeout
                  if (redirectTimeoutRef.current) {
                    clearTimeout(redirectTimeoutRef.current);
                    redirectTimeoutRef.current = null;
                  }
                  // Immediately complete payment and redirect
                  handlePaymentComplete();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                aria-label={t("paymentPopup.closeAriaLabel")}
              >
                <X size={18} className="text-gray-600" />
              </button>

              <div className="px-6 py-10 flex flex-col items-center text-center">
                {/* Success Icon with circular animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  className="relative w-24 h-24 rounded-full mb-6 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #2a3f5f, #3b4d6b)",
                    boxShadow: "0 0 0 8px rgba(42,63,95,0.1), 0 0 0 16px rgba(42,63,95,0.05), 0 12px 30px rgba(42,63,95,0.25)",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 12 }}
                  >
                    <Check size={48} strokeWidth={3} className="text-[#5de0a0]" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[#2a3f5f] font-bold text-2xl mb-4 tracking-tight"
                >
                  {t("successPopup.title")}
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#6b7b92] text-sm leading-relaxed max-w-[280px]"
                >
                  {t("successPopup.message", {
                    tableLabel: t("tableLabel"),
                    tableNumber: effectiveTable,
                  })}
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
