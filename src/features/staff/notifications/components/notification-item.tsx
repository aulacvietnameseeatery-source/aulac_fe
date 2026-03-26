"use client";

import { CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateUtils } from "@/lib/date-utils";
import { useTranslations } from "next-intl";
import {
  TYPE_CONFIG,
  DEFAULT_TYPE_CONFIG,
} from "../constants/notification.constants";
import type { NotificationListItem } from "../types/notification.types";
import { resolveLocalizedNotification } from "../utils/resolve-localized-notification";

// --- Dark-theme icon color mapping (matches sidebar notification-panel style) ---
const ICON_COLORS: Record<string, string> = {
  Orders: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Reservations: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Tables: "bg-green-500/10 text-green-400 border-green-500/20",
  Inventory: "bg-red-500/10 text-red-400 border-red-500/20",
  Shifts: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  System: "bg-gray-100/10 text-gray-400 border-gray-500/20",
};
const DEFAULT_ICON_COLORS = "bg-blue-500/10 text-blue-400 border-blue-500/20";

type ItemRenderConfig = {
  showBody: boolean;
  showTypeLabel: boolean;
};

const DEFAULT_ITEM_RENDER_CONFIG: ItemRenderConfig = {
  showBody: true,
  showTypeLabel: true,
};

// Configure per-type item rendering here.
const ITEM_RENDER_BY_TYPE: Partial<Record<string, ItemRenderConfig>> = {
  SYSTEM_ALERT: { showBody: true, showTypeLabel: false },
  ORDER_ITEM_READY: { showBody: false, showTypeLabel: true },
  ORDER_ITEM_REJECTED: { showBody: false, showTypeLabel: true },
};

interface NotificationItemProps {
  notification: NotificationListItem;
  onRead: (id: number) => void;
  onAcknowledge: (id: number) => void;
  onNavigate?: (url: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onAcknowledge,
  onNavigate,
}: NotificationItemProps) {
  const t = useTranslations("Notifications");
  const typeConfig = TYPE_CONFIG[notification.type] ?? DEFAULT_TYPE_CONFIG;
  const Icon = typeConfig.icon;
  const iconColors = ICON_COLORS[typeConfig.category] ?? DEFAULT_ICON_COLORS;
  const renderConfig = ITEM_RENDER_BY_TYPE[notification.type] ?? DEFAULT_ITEM_RENDER_CONFIG;

  const { title: localizedTitle, body: localizedBody } = resolveLocalizedNotification(
    notification,
    t
  );

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }

    if (onNavigate) {
      if (notification.actionUrl) {
        onNavigate(notification.actionUrl);
      } else if (notification.entityType === "Reservation" && notification.entityId) {
        // Fallback for reservation notifications without actionUrl
        onNavigate(`/dashboard/reservations/${notification.entityId}`);
      }
    }
  };

  // Localized relative time with UTC-safe parsing
  const timeAgo = getRelativeTimeUtcSafe(notification.createdAt, t);

  return (
    <div
      onClick={handleClick}
      className="group p-3 rounded-xl hover:bg-white/5 transition-all relative cursor-pointer"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-9 h-9 rounded-lg border flex items-center justify-center shrink-0",
            iconColors
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-[13px] leading-relaxed">
            <span className={cn(
              notification.isRead ? "font-normal" : "text-white font-medium"
            )}>
              {localizedTitle}
            </span>
          </p>

          {renderConfig.showBody && localizedBody && (
            <p className="text-white/50 text-[12px] mt-0.5 line-clamp-2 leading-relaxed">
              {localizedBody}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-2 text-white/40 text-[11px]">
            <Clock size={12} />
            <span>{timeAgo}</span>
            <span>·</span>
            {renderConfig.showTypeLabel && (
              <span>
                {t(`types.${typeConfig.label}` as Parameters<typeof t>[0])}
              </span>
            )}

            {/* Acknowledge button for requireAck notifications */}
            {notification.requireAck && !notification.isAcknowledged && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(notification.id);
                }}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-[#1A3A52] bg-[#FFAB2D] rounded-md hover:bg-[#FFB952] transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                {t("acknowledge")}
              </button>
            )}

            {notification.isAcknowledged && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCheck className="w-3 h-3" />
                {t("acknowledged")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
      )}
    </div>
  );
}

// UTC-safe relative time helper using centralized date utilities.
function getRelativeTimeUtcSafe(
  dateStr: string,
  t: ReturnType<typeof useTranslations<"Notifications">>
): string {
  if (!dateStr) return "";

  const utcSafeDate = dateUtils.formatLocal(dateStr, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  const date = new Date(utcSafeDate).getTime();
  if (Number.isNaN(date)) return "";

  const now = Date.now();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return t("time.justNow");
  if (diffMin < 60) return t("time.minutesAgo", { count: diffMin });
  if (diffHr < 24) return t("time.hoursAgo", { count: diffHr });
  if (diffDay < 7) return t("time.daysAgo", { count: diffDay });
  return dateUtils.formatLocal(dateStr, "dd/MM/yyyy");
}

// _OLD: kept for rollback-safety/history during timezone migration.
function getRelativeTime_OLD_DEPRECATED(
  dateStr: string,
  t: ReturnType<typeof useTranslations<"Notifications">>
): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return t("time.justNow");
  if (diffMin < 60) return t("time.minutesAgo", { count: diffMin });
  if (diffHr < 24) return t("time.hoursAgo", { count: diffHr });
  if (diffDay < 7) return t("time.daysAgo", { count: diffDay });
  return new Date(dateStr).toLocaleDateString();
}
