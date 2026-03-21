import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import { useNotificationStore } from "../store/notification.store";
import type { NotificationQueryParams } from "../types/notification.types";

const QUERY_KEYS = {
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

/** Paginated notification list for center panel */
export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications, params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 30_000,
  });
}

/** Unread count for badge */
export function useUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30_000,
    refetchInterval: 60_000, // Poll mỗi 60s làm fallback nếu SignalR mất kết nối
  });
}

/** Mark single notification as read */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { markRead } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onMutate: (id) => {
      markRead(id); // Optimistic update trong Zustand
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unreadCount });
    },
  });
}

/** Mark all notifications read */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const { markAllRead } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: () => {
      markAllRead(); // Optimistic update
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unreadCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

/** Acknowledge a critical notification */
export function useAcknowledge() {
  const { acknowledge } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => notificationService.acknowledge(id),
    onMutate: (id) => {
      acknowledge(id); // Optimistic
    },
  });
}
