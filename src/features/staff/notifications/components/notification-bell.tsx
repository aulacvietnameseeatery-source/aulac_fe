"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotificationStore } from "../store/notification.store";

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const t = useTranslations("Notifications");
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const connected = useNotificationStore((s) => s.connected);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-[#1A3A52]/70 hover:text-[#1A3A52] hover:bg-[#D5BA98]/10 rounded-lg transition-all duration-200"
      aria-label={t("title")}
    >
      <Bell className="w-5 h-5" />

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Connection status indicator */}
      <span
        className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
          connected ? "bg-emerald-500" : "bg-red-400"
        }`}
        title={connected ? t("connected") : t("disconnected")}
      />
    </button>
  );
}
