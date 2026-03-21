"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { X, Inbox, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "../store/notification.store";
import { notificationService } from "../services/notification.service";
import { NotificationItem } from "./notification-item";
import { NotificationPreferences } from "./notification-preferences";
import { TYPE_CONFIG, DEFAULT_TYPE_CONFIG } from "../constants/notification.constants";
import type { NotificationQueryParams } from "../types/notification.types";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

type TabKey = "all" | "unread";

const TAKE = 20;
const CATEGORY_TAB_PREFIX = "category:";
const TAB_WINDOW_SIZE = 5;

type CategoryTabKey = `${typeof CATEGORY_TAB_PREFIX}${string}`;
type NotificationTabKey = TabKey | CategoryTabKey;

function toCategoryTab(category: string): CategoryTabKey {
  return `${CATEGORY_TAB_PREFIX}${category}`;
}

function isCategoryTab(tab: NotificationTabKey): tab is CategoryTabKey {
  return tab.startsWith(CATEGORY_TAB_PREFIX);
}

function categoryFromTab(tab: CategoryTabKey): string {
  return tab.slice(CATEGORY_TAB_PREFIX.length);
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<NotificationTabKey>("all");
  const [tabWindowStart, setTabWindowStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

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

  const categoryTabs = useMemo(() => {
    const uniqueCategories = new Set<string>();
    for (const config of Object.values(TYPE_CONFIG)) {
      uniqueCategories.add(config.category);
    }
    uniqueCategories.add(DEFAULT_TYPE_CONFIG.category);
    return Array.from(uniqueCategories);
  }, []);

  const getNotificationCategory = useCallback((type: string) => {
    const config = TYPE_CONFIG[type] ?? DEFAULT_TYPE_CONFIG;
    return config.category;
  }, []);

  const tabCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const category = getNotificationCategory(item.type);
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  }, [items, getNotificationCategory]);

  const tabs = useMemo(
    () => [
      { key: "all" as NotificationTabKey, label: t("tabs.all"), count: items.length },
      { key: "unread" as NotificationTabKey, label: t("tabs.unread"), count: unreadCount },
      ...categoryTabs.map((category) => ({
        key: toCategoryTab(category),
        label: t(`categories.${category}` as Parameters<typeof t>[0]),
        count: tabCountByCategory[category] ?? 0,
      })),
    ],
    [t, items.length, unreadCount, categoryTabs, tabCountByCategory]
  );

  const maxTabWindowStart = Math.max(0, tabs.length - TAB_WINDOW_SIZE);
  const visibleTabs = tabs.slice(tabWindowStart, tabWindowStart + TAB_WINDOW_SIZE);

  useEffect(() => {
    setTabWindowStart((prev) => Math.min(prev, maxTabWindowStart));
  }, [maxTabWindowStart]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((entry) => entry.key === tab);
    if (activeIndex < 0) return;

    if (activeIndex < tabWindowStart) {
      setTabWindowStart(activeIndex);
      return;
    }

    const tabWindowEnd = tabWindowStart + TAB_WINDOW_SIZE - 1;
    if (activeIndex > tabWindowEnd) {
      setTabWindowStart(Math.min(activeIndex - TAB_WINDOW_SIZE + 1, maxTabWindowStart));
    }
  }, [tab, tabs, tabWindowStart, maxTabWindowStart]);

  const displayItems = useMemo(() => {
    if (tab === "all") {
      return items;
    }
    if (tab === "unread") {
      return items.filter((n) => !n.isRead);
    }
    const selectedCategory = categoryFromTab(tab);
    return items.filter((n) => getNotificationCategory(n.type) === selectedCategory);
  }, [items, tab, getNotificationCategory]);

  const groupedDisplayItems = useMemo(() => {
    const grouped: Record<string, typeof displayItems> = {};
    for (const item of displayItems) {
      const category = getNotificationCategory(item.type);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    }

    const preferredOrder = isCategoryTab(tab)
      ? [categoryFromTab(tab)]
      : categoryTabs;

    const ordered: Array<{ category: string; notifications: typeof displayItems }> = [];
    for (const category of preferredOrder) {
      const notifications = grouped[category];
      if (notifications?.length) {
        ordered.push({ category, notifications });
      }
    }

    for (const [category, notifications] of Object.entries(grouped)) {
      if (!preferredOrder.includes(category)) {
        ordered.push({ category, notifications });
      }
    }

    return ordered;
  }, [displayItems, getNotificationCategory, tab, categoryTabs]);

  // Tải thêm (load more)
  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const params: NotificationQueryParams = {
        skip: items.length,
        take: TAKE,
        unreadOnly: false,
      };
      const more = await notificationService.getNotifications(params);
      if (more.length < TAKE) setHasMore(false);
      appendItems(more);
    } catch (err) {
      console.error("[NotificationCenter] Load more failed:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, items.length, appendItems]);

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

  // Navigate — actionUrl handling (prepend locale for Next.js routing)
  const handleNavigate = useCallback(
    (url: string) => {
      onClose();
      router.push(`/${locale}${url}`);
    },
    [onClose, router, locale]
  );

  // Tải lần đầu khi mở
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setHasMore(true);
    try {
      const data = await notificationService.getNotifications({
        skip: 0,
        take: TAKE,
        unreadOnly: false,
      });
      setItems(data);
      if (data.length < TAKE) setHasMore(false);
    } catch (err) {
      console.error("[NotificationCenter] Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [setItems]);

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

      {/* Panel — Dark navy theme matching sidebar aesthetic */}
      <div
        ref={panelRef}
        className={`
          fixed flex min-h-0 flex-col overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-300
          bg-[#1A3A51] border border-white/10 rounded-2xl shadow-2xl
          right-4 top-14 w-105 h-[min(calc(100vh-72px),720px)]
        `}
      >
        {showPreferences ? (
          <NotificationPreferences onBack={() => setShowPreferences(false)} />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-base">{t("title")}</h3>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="text-[#FFAB2D] text-xs font-medium hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline"
                  title={t("markAllRead")}
                >
                  {t("markAllReadShort")}
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                  title={t("preferences.title")}
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="p-2 bg-black/10 flex items-center gap-1 shrink-0">
              <button
                onClick={() => setTabWindowStart((prev) => Math.max(0, prev - 1))}
                disabled={tabWindowStart === 0}
                className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous tabs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex gap-1">
                  {visibleTabs.map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        tab === key
                          ? "bg-white text-[#1A3A51] shadow-sm"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {label}
                      {count > 0 && key !== "all" && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setTabWindowStart((prev) => Math.min(maxTabWindowStart, prev + 1))}
                disabled={tabWindowStart >= maxTabWindowStart}
                className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next tabs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* List — scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1">
              {displayItems.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <Inbox className="w-10 h-10 mb-2" />
                  <p className="text-sm">
                    {tab === "unread" ? t("emptyUnread") : t("empty")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-3">
                  {groupedDisplayItems.map(({ category, notifications }) => (
                    <div key={category}>
                      <h6 className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-3">
                        {t(`categories.${category}` as Parameters<typeof t>[0])}
                      </h6>
                      <div className="space-y-1">
                        {notifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={handleRead}
                            onAcknowledge={handleAcknowledge}
                            onNavigate={handleNavigate}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Load more */}
                  {hasMore && displayItems.length > 0 && (
                    <div className="py-3 text-center">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-4 py-1.5 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                      >
                        {loading ? t("loading") : t("loadMore")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {loading && displayItems.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-r-transparent" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
