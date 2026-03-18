"use client";

import { useState, useCallback } from "react";
import { X, CheckCheck, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useNotificationStore } from "../store/notification.store";
import { notificationService } from "../services/notification.service";
import { NotificationItem } from "./notification-item";
import type { NotificationQueryParams } from "../types/notification.types";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

type TabKey = "all" | "unread";

const TAKE = 20;

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const t = useTranslations("Notifications");
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const {
    items,
    unreadCount,
    connected,
    markRead,
    markAllRead,
    acknowledge,
    setItems,
    appendItems,
  } = useNotificationStore();

  const displayItems = tab === "unread" ? items.filter((n) => !n.isRead) : items;

  // Tải thêm (load more)
  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const params: NotificationQueryParams = {
        skip: items.length,
        take: TAKE,
        unreadOnly: tab === "unread",
      };
      const more = await notificationService.getNotifications(params);
      if (more.length < TAKE) setHasMore(false);
      appendItems(more);
    } catch (err) {
      console.error("[NotificationCenter] Load more failed:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, items.length, tab, appendItems]);

  // Đánh dấu đã đọc 1
  const handleRead = useCallback(
    async (id: number) => {
      markRead(id); // Optimistic
      try {
        await notificationService.markAsRead(id);
      } catch {
        // Revert sẽ xử lý ở phase sau nếu cần
      }
    },
    [markRead]
  );

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = useCallback(async () => {
    markAllRead(); // Optimistic
    try {
      await notificationService.markAllRead();
    } catch {
      // Revert sẽ xử lý ở phase sau nếu cần
    }
  }, [markAllRead]);

  // Xác nhận
  const handleAcknowledge = useCallback(
    async (id: number) => {
      acknowledge(id); // Optimistic
      try {
        await notificationService.acknowledge(id);
      } catch {
        // Revert sẽ xử lý ở phase sau nếu cần
      }
    },
    [acknowledge]
  );

  // Navigate — actionUrl handling
  const handleNavigate = useCallback(
    (url: string) => {
      onClose();
      window.location.href = url;
    },
    [onClose]
  );

  // Tải lần đầu khi mở
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setHasMore(true);
    try {
      const data = await notificationService.getNotifications({
        skip: 0,
        take: TAKE,
        unreadOnly: tab === "unread",
      });
      setItems(data);
      if (data.length < TAKE) setHasMore(false);
    } catch (err) {
      console.error("[NotificationCenter] Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [tab, setItems]);

  // Fetch khi mở panel
  const panelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && open) {
        handleRefresh();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-4 top-14 z-50 w-100 max-h-[calc(100vh-80px)] bg-white border border-[#D5BA98]/40 rounded-xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1A3A52]">{t("title")}</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
            {/* Connection indicator */}
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                connected ? "bg-emerald-500" : "bg-red-400"
              )}
              title={connected ? t("connected") : t("disconnected")}
            />
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-gray-50 rounded-md transition-colors"
                title={t("markAllRead")}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("markAllReadShort")}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#1A3A52]/40 hover:text-[#1A3A52] hover:bg-gray-50 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(["all", "unread"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors border-b-2",
                tab === key
                  ? "text-[#1A3A52] border-[#1A3A52]"
                  : "text-[#1A3A52]/40 border-transparent hover:text-[#1A3A52]/60"
              )}
            >
              {key === "all" ? t("tabs.all") : `${t("tabs.unread")} (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {displayItems.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#1A3A52]/30">
              <Inbox className="w-10 h-10 mb-2" />
              <p className="text-sm">
                {tab === "unread" ? t("emptyUnread") : t("empty")}
              </p>
            </div>
          ) : (
            <>
              {displayItems.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                  onAcknowledge={handleAcknowledge}
                  onNavigate={handleNavigate}
                />
              ))}

              {/* Load more */}
              {hasMore && displayItems.length > 0 && (
                <div className="py-3 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-4 py-1.5 text-xs text-[#1A3A52]/60 hover:text-[#1A3A52] bg-gray-50 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loading ? t("loading") : t("loadMore")}
                  </button>
                </div>
              )}
            </>
          )}

          {loading && displayItems.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A3A52] border-r-transparent" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
