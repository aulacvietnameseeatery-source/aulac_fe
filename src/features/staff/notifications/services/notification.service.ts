import { api } from "@/lib/http";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  NotificationListItem,
  NotificationQueryParams,
  NotificationPreferenceDto,
  UpdateNotificationPreferencesRequest,
} from "../types/notification.types";

export const notificationService = {
  async getNotifications(
    params?: NotificationQueryParams
  ): Promise<NotificationListItem[]> {
    const query = new URLSearchParams();
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.take != null) query.set("take", String(params.take));
    if (params?.type) query.set("type", params.type);
    if (params?.unreadOnly) query.set("unreadOnly", "true");

    const qs = query.toString();
    const res = await api.get<ApiResponse<NotificationListItem[]>>(
      `/api/notifications${qs ? `?${qs}` : ""}`
    );
    return res.data ?? [];
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<number>>("/api/notifications/unread-count");
    return res.data ?? 0;
  },

  async getMissed(after: string): Promise<NotificationListItem[]> {
    const res = await api.get<ApiResponse<NotificationListItem[]>>(
      `/api/notifications/missed?after=${encodeURIComponent(after)}`
    );
    return res.data ?? [];
  },

  async markAsRead(id: number): Promise<void> {
    await api.post<ApiResponse<object>, null>(`/api/notifications/${id}/read`, null);
  },

  async markAllRead(): Promise<void> {
    await api.post<ApiResponse<object>, null>("/api/notifications/mark-all-read", null);
  },

  async acknowledge(id: number): Promise<void> {
    await api.post<ApiResponse<object>, null>(`/api/notifications/${id}/ack`, null);
  },

  // --- Notification Preferences ---

  async getPreferences(): Promise<NotificationPreferenceDto[]> {
    const res = await api.get<ApiResponse<NotificationPreferenceDto[]>>(
      "/api/notifications/preferences"
    );
    return res.data ?? [];
  },

  async updatePreferences(request: UpdateNotificationPreferencesRequest): Promise<void> {
    await api.put<ApiResponse<object>, UpdateNotificationPreferencesRequest>(
      "/api/notifications/preferences",
      request
    );
  },
};
