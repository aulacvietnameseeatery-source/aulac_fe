import { create } from "zustand";
import { dateUtils } from "@/lib/date-utils";
import { MAX_STORE_ITEMS } from "../constants/notification.constants";
import type { NotificationDto, NotificationListItem, NotificationPreferenceDto } from "../types/notification.types";

interface NotificationState {
  items: NotificationListItem[];
  unreadCount: number;
  connected: boolean;
  lastReceivedAt: string | null;
  lastChangeSource: "idle" | "realtime" | "missed" | "list-sync";
  lastAddedIds: number[];
  /** Per-type notification preferences (loaded from API) */
  preferences: NotificationPreferenceDto[];
  /** Global state for reservation detail modal */
  detailReservationId: number | null;
}

interface NotificationActions {
  addNotification: (notification: NotificationDto) => void;
  mergeMissed: (notifications: NotificationListItem[]) => void;
  setItems: (items: NotificationListItem[]) => void;
  appendItems: (items: NotificationListItem[]) => void;
  markRead: (notificationId: number) => void;
  markAllRead: () => void;
  acknowledge: (notificationId: number) => void;
  setUnreadCount: (count: number) => void;
  setConnected: (connected: boolean) => void;
  setPreferences: (preferences: NotificationPreferenceDto[]) => void;
  setDetailReservationId: (id: number | null) => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>(
  (set) => ({
    // State
    items: [],
    unreadCount: 0,
    connected: false,
    lastReceivedAt: null,
    lastChangeSource: "idle",
    lastAddedIds: [],
    preferences: [],
    detailReservationId: null,

    // Actions
    addNotification: (notification) =>
      set((state) => {
        // Dedup
        if (state.items.some((n) => n.id === notification.id)) {
          return {
            ...state,
            lastChangeSource: "idle",
            lastAddedIds: [],
          };
        }

        const newItem: NotificationListItem = {
          ...notification,
          isRead: false,
          isAcknowledged: false,
          acknowledgedAt: null,
        };

        const items = [newItem, ...state.items].slice(0, MAX_STORE_ITEMS);

        return {
          items,
          unreadCount: state.unreadCount + 1,
          lastReceivedAt: notification.createdAt,
          lastChangeSource: "realtime",
          lastAddedIds: [notification.id],
        };
      }),

    mergeMissed: (notifications) =>
      set((state) => {
        const existingIds = new Set(state.items.map((n) => n.id));
        const newItems = notifications.filter((n) => !existingIds.has(n.id));

        if (newItems.length === 0) {
          return {
            ...state,
            lastChangeSource: "idle",
            lastAddedIds: [],
          };
        }

        const merged = [...newItems, ...state.items]
          .sort((a, b) => parseCreatedAtUtcSafeMs(b.createdAt) - parseCreatedAtUtcSafeMs(a.createdAt))
          .slice(0, MAX_STORE_ITEMS);

        const unreadCount = merged.filter((n) => !n.isRead).length;

        return {
          items: merged,
          unreadCount,
          lastChangeSource: "missed",
          lastAddedIds: newItems.map((n) => n.id),
        };
      }),

    setItems: (items) =>
      set(() => ({
        items,
        unreadCount: items.filter((n) => !n.isRead).length,
        lastChangeSource: "list-sync",
        lastAddedIds: [],
      })),

    appendItems: (newItems) =>
      set((state) => {
        const existingIds = new Set(state.items.map((n) => n.id));
        const unique = newItems.filter((n) => !existingIds.has(n.id));
        const mergedItems = [...state.items, ...unique];
        return {
          items: mergedItems,
          unreadCount: mergedItems.filter((n) => !n.isRead).length,
          lastChangeSource: "list-sync",
          lastAddedIds: [],
        };
      }),

    markRead: (notificationId) =>
      set((state) => ({
        items: state.items.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount -
          (state.items.find((n) => n.id === notificationId && !n.isRead) ? 1 : 0)
        ),
      })),

    markAllRead: () =>
      set((state) => ({
        items: state.items.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

    acknowledge: (notificationId) =>
      set((state) => ({
        items: state.items.map((n) =>
          n.id === notificationId
            ? { ...n, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
            : n
        ),
      })),

    setUnreadCount: (count) => set({ unreadCount: count }),

    setConnected: (connected) => set({ connected }),

    setPreferences: (preferences) => set({ preferences }),

    setDetailReservationId: (id) => set({ detailReservationId: id }),
  })
);

function parseCreatedAtUtcSafeMs(createdAt: string): number {
  if (!createdAt) return 0;
  const utcSafeDate = dateUtils.formatLocal(createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  const parsed = new Date(utcSafeDate).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}
