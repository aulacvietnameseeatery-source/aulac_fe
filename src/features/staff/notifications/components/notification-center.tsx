"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { X, Inbox, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing"
import { useNotificationStore } from "../store/notification.store";
import { notificationService } from "../services/notification.service";
import { NotificationItem } from "./notification-item";
import { NotificationPreferences } from "./notification-preferences";
import { TYPE_CONFIG, DEFAULT_TYPE_CONFIG } from "../constants/notification.constants";
import type { NotificationQueryParams } from "../types/notification.types";
import { parseNotificationCreatedAtMs } from "../utils/notification-time";
import { ReservationDetailModal } from "@/features/staff/reservation-management/components/reservation-detail-modal";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

type TabKey = "all" | "unread";

const TAKE = 20;
const CATEGORY_TAB_PREFIX = "category:";

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

function parseNotificationCreatedAtMs_DEPRECATED(createdAt: string): number {
  if (!createdAt) return 0;

  const parsed = new Date(createdAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const t = useTranslations("Notifications");
  const router = useRouter();
  const tabScrollRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<NotificationTabKey>("all");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
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
    detailReservationId,
    setDetailReservationId,
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
      if (item.isRead) continue;
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

  const updateTabScrollState = useCallback(() => {
    const node = tabScrollRef.current;
    if (!node) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    setCanScrollPrev(node.scrollLeft > 2);
    setCanScrollNext(node.scrollLeft < maxScrollLeft - 2);
  }, []);

  const scrollTabsBy = useCallback((direction: "prev" | "next") => {
    const node = tabScrollRef.current;
    if (!node) return;

    const offset = direction === "prev" ? -180 : 180;
    node.scrollBy({ left: offset, behavior: "smooth" });
  }, []);

  const stopNavButtonEvent = useCallback((event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useEffect(() => {
    updateTabScrollState();

    const node = tabScrollRef.current;
    if (!node) return;

    const handleScroll = () => updateTabScrollState();
    const handleResize = () => updateTabScrollState();

    node.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      node.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [tabs.length, open, updateTabScrollState]);

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

  const isTimeSortedTab = tab === "all" || tab === "unread";

  const timeSortedDisplayItems = useMemo(() => {
    if (!isTimeSortedTab) {
      return displayItems;
    }

    return [...displayItems].sort(
      (left, right) =>
        parseNotificationCreatedAtMs(right.createdAt) -
        parseNotificationCreatedAtMs(left.createdAt)
    );
  }, [displayItems, isTimeSortedTab]);

  const groupedDisplayItems = useMemo(() => {
    if (isTimeSortedTab) {
      return [];
    }

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
  }, [displayItems, getNotificationCategory, isTimeSortedTab, tab, categoryTabs]);

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
      // Intercept reservation detail URL: /dashboard/reservations/123 or variants
      const reservationMatch = url.match(/(?:\/dashboard)?\/reservations\/(\d+)/i);
      if (reservationMatch) {
        setDetailReservationId(Number(reservationMatch[1]));
        onClose();
        return;
      }

      onClose();
      router.push(`/${url}`);
    },
    [onClose, router, setDetailReservationId]
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

  const isOpen = open;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel — Dark navy theme matching sidebar aesthetic */}
      {isOpen && (
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
                  type="button"
                  onPointerDown={stopNavButtonEvent}
                  onClick={(event) => {
                    stopNavButtonEvent(event);
                    scrollTabsBy("prev");
                  }}
                  disabled={!canScrollPrev}
                  className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous tabs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={tabScrollRef}
                  className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="flex gap-1 w-max pr-1">
                    {tabs.map(({ key, label, count }) => (
                      <button
                        type="button"
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
                  type="button"
                  onPointerDown={stopNavButtonEvent}
                  onClick={(event) => {
                    stopNavButtonEvent(event);
                    scrollTabsBy("next");
                  }}
                  disabled={!canScrollNext}
                  className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next tabs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* List — scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1">
                {timeSortedDisplayItems.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/20">
                    <Inbox className="w-10 h-10 mb-2" />
                    <p className="text-sm">
                      {tab === "unread" ? t("emptyUnread") : t("empty")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {isTimeSortedTab ? (
                      <div className="space-y-1">
                        {timeSortedDisplayItems.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={handleRead}
                            onAcknowledge={handleAcknowledge}
                            onNavigate={handleNavigate}
                          />
                        ))}
                      </div>
                    ) : (
                      groupedDisplayItems.map(({ category, notifications }) => (
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
                      ))
                    )}

                    {/* Load more */}
                    {hasMore && timeSortedDisplayItems.length > 0 && (
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

                {loading && timeSortedDisplayItems.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <ReservationDetailModal
        reservationId={detailReservationId}
        open={!!detailReservationId}
        onClose={() => setDetailReservationId(null)}
      />
    </>
  );
}
