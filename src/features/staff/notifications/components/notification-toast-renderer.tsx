"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useNotificationStore } from "../store/notification.store";
import { PRIORITY_CONFIG } from "../constants/notification.constants";
import { NotificationPriority } from "../types/notification.types";

/**
 * Renders sonner toasts for new incoming notifications.
 * Mount this component inside NotificationProvider.
 */
export function NotificationToastRenderer() {
  const t = useTranslations("Notifications");
  const items = useNotificationStore((s) => s.items);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const currentCount = items.length;

    // Chỉ hiển thị toast cho notification mới (items thêm ở đầu mảng)
    if (currentCount > prevCountRef.current) {
      const newCount = currentCount - prevCountRef.current;
      const newItems = items.slice(0, newCount);

      for (const notification of newItems) {
        const config = PRIORITY_CONFIG[notification.priority] ?? PRIORITY_CONFIG.Normal;
        const duration = config.toastDuration;

        // Resolve localized title/body for toast
        const metadata = notification.metadata ?? {};
        const typeKey = notification.type as string;
        const title = t.has(`messages.${typeKey}.title`)
          ? t(`messages.${typeKey}.title` as Parameters<typeof t>[0], metadata)
          : notification.title;
        const body = notification.body
          ? t.has(`messages.${typeKey}.body`)
            ? t(`messages.${typeKey}.body` as Parameters<typeof t>[0], metadata)
            : notification.body
          : undefined;

        const toastOptions = {
          description: body,
          duration: duration === Infinity ? undefined : duration,
          dismissible: true,
        };

        switch (notification.priority) {
          case NotificationPriority.Critical:
            toast.error(title, {
              ...toastOptions,
              duration: Infinity, // Manual dismiss
            });
            break;
          case NotificationPriority.High:
            toast.warning(title, toastOptions);
            break;
          default:
            toast.info(title, toastOptions);
            break;
        }
      }
    }

    prevCountRef.current = currentCount;
  }, [items, t]);

  return null;
}
