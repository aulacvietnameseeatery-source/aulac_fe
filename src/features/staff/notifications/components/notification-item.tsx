"use client";

import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  DEFAULT_TYPE_CONFIG,
} from "../constants/notification.constants";
import type { NotificationListItem } from "../types/notification.types";

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
  const priorityConfig = PRIORITY_CONFIG[notification.priority] ?? PRIORITY_CONFIG.Normal;
  const Icon = typeConfig.icon;

  // Resolve localized title/body: try message template with metadata, fall back to raw
  const metadata = notification.metadata ?? {};
  const typeKey = notification.type as string;
  const localizedTitle = t.has(`messages.${typeKey}.title`)
    ? t(`messages.${typeKey}.title` as Parameters<typeof t>[0], metadata)
    : notification.title;
  const localizedBody = notification.body
    ? t.has(`messages.${typeKey}.body`)
      ? t(`messages.${typeKey}.body` as Parameters<typeof t>[0], metadata)
      : notification.body
    : undefined;

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
    }
  };

  // Localized relative time
  const timeAgo = getRelativeTime(notification.createdAt, t);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex gap-3 px-4 py-3 border-l-3 cursor-pointer transition-colors duration-150",
        priorityConfig.borderColor,
        notification.isRead
          ? "bg-white hover:bg-gray-50"
          : "bg-[#D5BA98]/5 hover:bg-[#D5BA98]/10"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5",
          priorityConfig.bgColor
        )}
      >
        <Icon className={cn("w-4 h-4", priorityConfig.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              notification.isRead
                ? "text-[#1A3A52]/70 font-normal"
                : "text-[#1A3A52] font-semibold"
            )}
          >
            {localizedTitle}
          </p>
          {/* Unread dot */}
          {!notification.isRead && (
            <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>

        {localizedBody && (
          <p className="text-xs text-[#1A3A52]/50 mt-0.5 line-clamp-2">
            {localizedBody}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-[#1A3A52]/40">{timeAgo}</span>
          <span className="text-[10px] text-[#1A3A52]/30">·</span>
          <span className="text-[10px] text-[#1A3A52]/40">
            {t(`types.${typeConfig.label}` as Parameters<typeof t>[0])}
          </span>

          {/* Acknowledge button for requireAck notifications */}
          {notification.requireAck && !notification.isAcknowledged && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge(notification.id);
              }}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              {t("acknowledge")}
            </button>
          )}

          {notification.isAcknowledged && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600">
              <CheckCheck className="w-3 h-3" />
              {t("acknowledged")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Localized relative time helper
function getRelativeTime(
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
