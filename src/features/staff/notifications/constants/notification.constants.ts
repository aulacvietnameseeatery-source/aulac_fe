import {
  ShoppingCart,
  XCircle,
  ChefHat,
  Ban,
  CheckCircle2,
  CreditCard,
  CalendarPlus,
  CalendarClock,
  Bell,
  Grid3X3,
  AlertTriangle,
  PackageX,
  UserCheck,
  Clock,
  ShieldAlert,
  RefreshCw,
  Receipt,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { NotificationPriority, NotificationType } from "../types/notification.types";

// --- Priority → UI mapping ---

export const PRIORITY_CONFIG: Record<
  string,
  { color: string; bgColor: string; borderColor: string; toastDuration: number }
> = {
  [NotificationPriority.Low]: {
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    toastDuration: 3000,
  },
  [NotificationPriority.Normal]: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    toastDuration: 5000,
  },
  [NotificationPriority.High]: {
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    toastDuration: 8000,
  },
  [NotificationPriority.Critical]: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    toastDuration: Infinity,
  },
};

// --- Notification Type → display config ---
// `label` is the i18n key suffix under Notifications.types.*

export const TYPE_CONFIG: Record<
  string,
  { icon: typeof ShoppingCart; label: string; category: string }
> = {
  [NotificationType.NEW_ORDER]: { icon: ShoppingCart, label: "NEW_ORDER", category: "Orders" },
  [NotificationType.ORDER_CANCELLED]: { icon: XCircle, label: "ORDER_CANCELLED", category: "Orders" },
  [NotificationType.ORDER_ITEM_READY]: { icon: ChefHat, label: "ORDER_ITEM_READY", category: "Orders" },
  [NotificationType.ORDER_ITEM_REJECTED]: { icon: Ban, label: "ORDER_ITEM_REJECTED", category: "Orders" },
  [NotificationType.ALL_ITEMS_READY]: { icon: CheckCircle2, label: "ALL_ITEMS_READY", category: "Orders" },
  [NotificationType.PAYMENT_COMPLETED]: { icon: CreditCard, label: "PAYMENT_COMPLETED", category: "Orders" },
  [NotificationType.RESERVATION_CREATED]: { icon: CalendarPlus, label: "RESERVATION_CREATED", category: "Reservations" },
  [NotificationType.RESERVATION_STATUS_CHANGED]: { icon: CalendarClock, label: "RESERVATION_STATUS_CHANGED", category: "Reservations" },
  [NotificationType.RESERVATION_REMINDER]: { icon: Bell, label: "RESERVATION_REMINDER", category: "Reservations" },
  [NotificationType.TABLE_STATUS_CHANGED]: { icon: Grid3X3, label: "TABLE_STATUS_CHANGED", category: "Tables" },
  [NotificationType.LOW_STOCK_ALERT]: { icon: AlertTriangle, label: "LOW_STOCK_ALERT", category: "Inventory" },
  [NotificationType.DISH_OUT_OF_STOCK]: { icon: PackageX, label: "DISH_OUT_OF_STOCK", category: "Inventory" },
  [NotificationType.SHIFT_ASSIGNED]: { icon: UserCheck, label: "SHIFT_ASSIGNED", category: "Shifts" },
  [NotificationType.ATTENDANCE_ALERT]: { icon: Clock, label: "ATTENDANCE_ALERT", category: "Shifts" },
  [NotificationType.SYSTEM_ALERT]: { icon: ShieldAlert, label: "SYSTEM_ALERT", category: "System" },
  [NotificationType.ORDER_STATUS_CHANGED]: { icon: RefreshCw, label: "ORDER_STATUS_CHANGED", category: "Orders" },
  [NotificationType.PAYMENT_REQUEST]: { icon: Receipt, label: "PAYMENT_REQUEST", category: "Orders" },
  [NotificationType.ORDER_ITEMS_ADDED]: { icon: PlusCircle, label: "ORDER_ITEMS_ADDED", category: "Orders" },
  [NotificationType.ORDER_ITEM_CANCELLED]: { icon: MinusCircle, label: "ORDER_ITEM_CANCELLED", category: "Orders" },
};

// Fallback config when type not found
export const DEFAULT_TYPE_CONFIG = { icon: Bell, label: "fallback", category: "General" };

// Max notifications kept in memory
export const MAX_STORE_ITEMS = 200;

// SignalR event name
export const SIGNALR_EVENT_RECEIVE = "ReceiveNotification";

// --- Anti-spam toast settings ---

/** Max notification toasts visible at once */
export const MAX_VISIBLE_TOASTS = 3;

/** Minimum gap between toasts of the same type+entity (ms) */
export const TOAST_DEDUP_WINDOW_MS = 10_000;

/** Global cooldown between any notification toast (ms) */
export const TOAST_GLOBAL_COOLDOWN_MS = 1_500;

/** When more than MAX_VISIBLE_TOASTS arrive in quick succession, batch them into a summary toast after this delay (ms) */
export const TOAST_BATCH_DELAY_MS = 800;
