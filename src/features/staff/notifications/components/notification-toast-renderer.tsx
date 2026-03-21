"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { BellRing, Bell, X } from "lucide-react";
import { useNotificationStore } from "../store/notification.store";
import {
  PRIORITY_CONFIG,
  MAX_VISIBLE_TOASTS,
  TOAST_DEDUP_WINDOW_MS,
  TOAST_GLOBAL_COOLDOWN_MS,
  TOAST_BATCH_DELAY_MS,
} from "../constants/notification.constants";
import { NotificationPriority } from "../types/notification.types";
import type { NotificationListItem } from "../types/notification.types";
import { useNotificationSound } from "../hooks/use-notification-sound";
import { resolveLocalizedNotification } from "../utils/resolve-localized-notification";

// ---------------------------------------------------------------------------
// Anti-spam state (module-level, survives re-renders)
// ---------------------------------------------------------------------------

/** Map of "type:entityId" → last-shown timestamp for dedup */
const recentToastKeys = new Map<string, number>();

/** Timestamp of last toast shown (global cooldown) */
let lastToastAt = 0;

/** Count of toasts shown in the current burst window */
let burstCount = 0;

/** Timer for batched summary toast */
let batchTimer: ReturnType<typeof setTimeout> | null = null;

/** Queued notifications waiting to be shown in a summary */
let batchQueue: NotificationListItem[] = [];

function dedupKey(n: Pick<NotificationListItem, "type" | "entityType" | "entityId">) {
  return `${n.type}:${n.entityType ?? ""}:${n.entityId ?? ""}`;
}

function isDuplicate(n: NotificationListItem) {
  const key = dedupKey(n);
  const prev = recentToastKeys.get(key);
  if (prev && Date.now() - prev < TOAST_DEDUP_WINDOW_MS) return true;
  return false;
}

function recordShown(n: NotificationListItem) {
  recentToastKeys.set(dedupKey(n), Date.now());
  lastToastAt = Date.now();
  burstCount++;

  // Decay burst counter after the dedup window
  setTimeout(() => { burstCount = Math.max(0, burstCount - 1); }, TOAST_DEDUP_WINDOW_MS);
}

function isGlobalCooldown() {
  return Date.now() - lastToastAt < TOAST_GLOBAL_COOLDOWN_MS;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders sonner toasts for new incoming notifications.
 * Uses a dedicated Sonner instance (NotificationToaster, top-right)
 * so notification toasts don't intermix with app success/error toasts.
 *
 * Anti-spam features:
 * - Dedup: same type+entity within 10s is suppressed
 * - Global cooldown: 1.5s between any notification toast
 * - Burst cap: max 3 individual toasts, then batch into a summary
 * - Critical priority bypasses burst cap (never suppressed)
 */
export function NotificationToastRenderer() {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const router = useRouter();
  const { play: playSound } = useNotificationSound();
  const items = useNotificationStore((s) => s.items);
  const prevCountRef = useRef(0);

  // -- build a single notification toast node --
  const buildToastNode = useCallback(
    (notification: NotificationListItem, toastId: string | number) => {
      const { title, body } = resolveLocalizedNotification(notification, t);

      const toneClass =
        notification.priority === NotificationPriority.Critical
          ? "border-red-600"
          : notification.priority === NotificationPriority.High
            ? "border-amber-600"
            : notification.priority === NotificationPriority.Normal
              ? "border-blue-600"
              : "border-slate-500";

      return (
        <div className={`w-90 rounded-xl border ${toneClass} bg-white shadow-lg overflow-hidden`}>
          <div className="px-3 py-2 bg-[#D5BA98]/20 border-b border-[#D5BA98]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#1A3A52]" />
              <p className="text-xs font-semibold text-[#1A3A52] tracking-wide">{t("title")}</p>
            </div>
            <button
              onClick={() => toast.dismiss(toastId)}
              className="p-0.5 text-[#1A3A52]/40 hover:text-[#1A3A52] rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-sm font-semibold text-[#1A3A52] leading-snug">{title}</p>
            {body && <p className="text-xs text-[#1A3A52]/70 mt-1 leading-relaxed">{body}</p>}
            {notification.actionUrl && (
              <button
                onClick={() => router.push(`/${locale}${notification.actionUrl}`)}
                className="mt-2 inline-flex items-center text-[11px] font-medium text-blue-700 hover:text-blue-800"
              >
                {t("view")}
              </button>
            )}
          </div>
        </div>
      );
    },
    [t, locale, router]
  );

  // -- build a batched summary toast --
  const buildBatchToast = useCallback(
    (count: number, toastId: string | number) => (
      <div className="w-90 rounded-xl border border-[#D5BA98] bg-white shadow-lg overflow-hidden">
        <div className="px-3 py-2 bg-[#D5BA98]/20 border-b border-[#D5BA98]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1A3A52]" />
            <p className="text-xs font-semibold text-[#1A3A52] tracking-wide">{t("title")}</p>
          </div>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="p-0.5 text-[#1A3A52]/40 hover:text-[#1A3A52] rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-[#1A3A52] leading-snug">
            +{count} {t("batchSummary", { count })}
          </p>
        </div>
      </div>
    ),
    [t]
  );

  // -- flush batch queue into a single summary toast --
  const flushBatch = useCallback(() => {
    if (batchQueue.length === 0) return;
    const count = batchQueue.length;
    batchQueue = [];
    burstCount = 0;

    toast.custom((toastId) => buildBatchToast(count, toastId), {
      position: "top-right",
      duration: 5_000,
      dismissible: true,
      className: "!p-0 !bg-transparent !border-none !shadow-none",
    });
  }, [buildBatchToast]);

  // -- process a single notification --
  const showToast = useCallback(
    (notification: NotificationListItem) => {
      // Check user preference
      const preferences = useNotificationStore.getState().preferences;
      const pref = preferences.find((p) => p.notificationType === notification.type);
      if (pref && !pref.isEnabled) return;

      const isCritical = notification.priority === NotificationPriority.Critical;

      // Dedup: suppress same type+entity within window (except critical)
      if (!isCritical && isDuplicate(notification)) return;

      // Play sound (only once even if batched)
      const soundEnabled = !pref || pref.soundEnabled;
      if (soundEnabled) {
        playSound(notification.soundKey, notification.priority);
      }

      // Global cooldown + burst cap → queue into batch (except critical)
      if (!isCritical && (isGlobalCooldown() || burstCount >= MAX_VISIBLE_TOASTS)) {
        batchQueue.push(notification);
        recordShown(notification);

        // Schedule a batch flush
        if (!batchTimer) {
          batchTimer = setTimeout(() => {
            batchTimer = null;
            flushBatch();
          }, TOAST_BATCH_DELAY_MS);
        }
        return;
      }

      // Show individual toast
      recordShown(notification);

      const config = PRIORITY_CONFIG[notification.priority] ?? PRIORITY_CONFIG.Normal;
      const duration = isCritical ? Infinity : config.toastDuration;

      toast.custom((toastId) => buildToastNode(notification, toastId), {
        position: "top-right",
        duration: duration === Infinity ? undefined : duration,
        dismissible: true,
        className: "!p-0 !bg-transparent !border-none !shadow-none",
      });
    },
    [playSound, buildToastNode, flushBatch]
  );

  useEffect(() => {
    const currentCount = items.length;

    if (currentCount > prevCountRef.current) {
      const newCount = currentCount - prevCountRef.current;
      const newItems = items.slice(0, newCount);

      for (const notification of newItems) {
        showToast(notification as NotificationListItem);
      }
    }

    prevCountRef.current = currentCount;
  }, [items, showToast]);

  return null;
}
