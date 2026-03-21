import { create } from "zustand";
import { MAX_STORE_ITEMS } from "../constants/notification.constants";
import type { NotificationDto, NotificationListItem, NotificationPreferenceDto } from "../types/notification.types";

interface NotificationState {
  items: NotificationListItem[];
  unreadCount: number;
  connected: boolean;
  lastReceivedAt: string | null;
  /** Per-type notification preferences (loaded from API) */
  preferences: NotificationPreferenceDto[];
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
}

export const useNotificationStore = create<NotificationState & NotificationActions>(
  (set) => ({
    // State
    items: [],
    unreadCount: 0,
    connected: false,
    lastReceivedAt: null,
    preferences: [],

    // Actions
    addNotification: (notification) =>
      set((state) => {
        // Dedup
        if (state.items.some((n) => n.id === notification.id)) return state;

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
        };
      }),

    mergeMissed: (notifications) =>
      set((state) => {
        const existingIds = new Set(state.items.map((n) => n.id));
        const newItems = notifications.filter((n) => !existingIds.has(n.id));

        if (newItems.length === 0) return state;

        const merged = [...newItems, ...state.items]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, MAX_STORE_ITEMS);

        const unreadCount = merged.filter((n) => !n.isRead).length;

        return { items: merged, unreadCount };
      }),

    setItems: (items) =>
      set(() => ({
        items,
        unreadCount: items.filter((n) => !n.isRead).length,
      })),

    appendItems: (newItems) =>
      set((state) => {
        const existingIds = new Set(state.items.map((n) => n.id));
        const unique = newItems.filter((n) => !existingIds.has(n.id));
        return { items: [...state.items, ...unique] };
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
  })
);
