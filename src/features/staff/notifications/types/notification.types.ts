// Mirrors BE Core.Enum.NotificationType
export enum NotificationType {
  NEW_ORDER = "NEW_ORDER",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  ORDER_ITEM_READY = "ORDER_ITEM_READY",
  ORDER_ITEM_REJECTED = "ORDER_ITEM_REJECTED",
  ALL_ITEMS_READY = "ALL_ITEMS_READY",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  RESERVATION_CREATED = "RESERVATION_CREATED",
  RESERVATION_STATUS_CHANGED = "RESERVATION_STATUS_CHANGED",
  RESERVATION_REMINDER = "RESERVATION_REMINDER",
  TABLE_STATUS_CHANGED = "TABLE_STATUS_CHANGED",
  LOW_STOCK_ALERT = "LOW_STOCK_ALERT",
  DISH_OUT_OF_STOCK = "DISH_OUT_OF_STOCK",
  SHIFT_ASSIGNED = "SHIFT_ASSIGNED",
  ATTENDANCE_ALERT = "ATTENDANCE_ALERT",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED",
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  ORDER_ITEMS_ADDED = "ORDER_ITEMS_ADDED",
  ORDER_ITEM_CANCELLED = "ORDER_ITEM_CANCELLED",
}

// Mirrors BE Core.Enum.NotificationPriority
export enum NotificationPriority {
  Low = "Low",
  Normal = "Normal",
  High = "High",
  Critical = "Critical",
}

// Real-time push DTO — received via SignalR
export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  body: string | null;
  priority: string;
  requireAck: boolean;
  soundKey: string | null;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
}

// List item — includes read/ack state per user
export interface NotificationListItem extends NotificationDto {
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedAt: string | null;
}

// Query parameters for GET /api/notifications
export interface NotificationQueryParams {
  skip?: number;
  take?: number;
  type?: string;
  unreadOnly?: boolean;
}

// --- Notification Preferences ---

export interface NotificationPreferenceDto {
  notificationType: string;
  isEnabled: boolean;
  soundEnabled: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  preferences: NotificationPreferenceItemRequest[];
}

export interface NotificationPreferenceItemRequest {
  notificationType: string;
  isEnabled: boolean;
  soundEnabled: boolean;
}
