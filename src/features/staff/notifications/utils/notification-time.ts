import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";

const TIMEZONE_SUFFIX_REGEX = /(Z|[+-]\d{2}:?\d{2})$/i;

function normalizeNotificationTimestamp(createdAt: string): string {
  const raw = createdAt.trim();
  if (!raw) return "";

  // If backend returns datetime without timezone, treat it as UTC.
  if (TIMEZONE_SUFFIX_REGEX.test(raw)) {
    return raw;
  }

  return `${raw}Z`;
}

export function parseNotificationCreatedAtMs(createdAt: string): number {
  if (!createdAt) return 0;

  const normalized = normalizeNotificationTimestamp(createdAt);
  if (!normalized) return 0;

  const parsed = new Date(normalized).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatRelativeNotificationTime(
  createdAt: string,
  t: ReturnType<typeof useTranslations<"Notifications">>
): string {
  const createdAtMs = parseNotificationCreatedAtMs(createdAt);
  if (!createdAtMs) return "";

  const diffMs = Math.max(0, Date.now() - createdAtMs);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return t("time.justNow");
  if (diffMin < 60) return t("time.minutesAgo", { count: diffMin });
  if (diffHr < 24) return t("time.hoursAgo", { count: diffHr });
  if (diffDay < 7) return t("time.daysAgo", { count: diffDay });

  // Older than a week: keep existing display behavior (Swiss-local absolute time).
  return dateUtils.formatLocal(normalizeNotificationTimestamp(createdAt), "dd/MM/yyyy HH:mm");
}
