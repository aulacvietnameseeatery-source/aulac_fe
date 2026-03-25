import type { useTranslations } from "next-intl";
import type { NotificationDto } from "../types/notification.types";

type NotificationTranslator = ReturnType<typeof useTranslations<"Notifications">>;

const REQUIRED_METADATA_FIELDS: Record<string, { title?: string[]; body?: string[] }> = {
  NEW_ORDER: { title: ["orderId"], body: ["tableName"] },
  ORDER_CANCELLED: { title: ["orderId"], body: ["orderId"] },
  ORDER_ITEM_READY: {},
  ORDER_ITEM_REJECTED: {},
  ALL_ITEMS_READY: { title: ["orderId"], body: ["tableName"] },
  PAYMENT_COMPLETED: { body: ["orderId", "amount"] },
  RESERVATION_CREATED: { body: ["guestName", "guestCount", "time"] },
  RESERVATION_STATUS_CHANGED: { body: ["reservationId", "status"] },
  RESERVATION_REMINDER: { body: ["guestName", "minutes"] },
  TABLE_STATUS_CHANGED: { title: ["tableName"], body: ["oldStatus", "status"] },
  LOW_STOCK_ALERT: { title: ["ingredientName"], body: ["current", "minimum"] },
  DISH_OUT_OF_STOCK: { title: ["dishName"] },
  SHIFT_ASSIGNED: { body: ["shiftName", "date"] },
  ATTENDANCE_ALERT: { body: ["staffName", "reason"] },
  SYSTEM_ALERT: { body: ["message"] },
  ORDER_STATUS_CHANGED: { title: ["orderId"], body: ["orderId", "status"] },
  PAYMENT_REQUEST: { title: ["tableName"], body: ["orderId", "amount"] },
};

function hasRequiredMetadata(metadata: Record<string, string>, keys?: string[]) {
  if (!keys || keys.length === 0) return true;

  return keys.every((key) => {
    const value = metadata[key];
    return value !== undefined && value !== null && String(value).trim().length > 0;
  });
}

function localizeStatus(code: string | undefined, t: NotificationTranslator) {
  if (!code) return undefined;
  const statusCode = code.toUpperCase();

  return t.has(`metadata.statuses.${statusCode}` as Parameters<typeof t>[0])
    ? t(`metadata.statuses.${statusCode}` as Parameters<typeof t>[0])
    : code;
}

function localizeAttendanceReason(
  metadata: Record<string, string>,
  t: NotificationTranslator
) {
  const alertType = metadata.alertType?.toUpperCase();

  if (alertType === "LATE_CHECKIN") {
    return t("metadata.attendanceReasons.LATE_CHECKIN", {
      minutes: metadata.lateMinutes ?? 0,
    });
  }

  if (alertType === "EARLY_LEAVE") {
    return t("metadata.attendanceReasons.EARLY_LEAVE", {
      minutes: metadata.earlyLeaveMinutes ?? 0,
    });
  }

  return metadata.reason;
}

function normalizeMetadata(
  metadata: NotificationDto["metadata"],
  t: NotificationTranslator
): Record<string, string> {
  const raw = Object.fromEntries(
    Object.entries(metadata ?? {}).map(([key, value]) => [key, String(value ?? "")])
  );

  const normalized: Record<string, string> = { ...raw };

  normalized.tableName ||= raw.tableCode || (raw.tableId ? `#${raw.tableId}` : t("metadata.defaults.table"));
  normalized.guestName ||= raw.customerName || t("metadata.defaults.guest");
  normalized.guestCount ||= raw.partySize;
  normalized.time ||= raw.reservedTime;
  normalized.current ||= raw.currentStock;
  normalized.minimum ||= raw.minStock;
  normalized.shiftName ||= raw.templateName;
  normalized.date ||= raw.workDate;
  normalized.status ||= localizeStatus(raw.newStatus || raw.status, t) || "";
  normalized.oldStatus ||= localizeStatus(raw.oldStatus, t) || "";
  normalized.newStatus ||= localizeStatus(raw.newStatus, t) || "";
  normalized.reason ||= localizeAttendanceReason(raw, t) || raw.reason || "";
  normalized.staffName ||= raw.staffName || t("metadata.defaults.staff");

  return normalized;
}

export function resolveLocalizedNotification(
  notification: Pick<NotificationDto, "type" | "title" | "body" | "metadata">,
  t: NotificationTranslator
) {
  const typeKey = notification.type as string;
  const metadata = normalizeMetadata(notification.metadata, t);
  const requiredFields = REQUIRED_METADATA_FIELDS[typeKey];

  const canUseTitleTemplate =
    t.has(`messages.${typeKey}.title` as Parameters<typeof t>[0]) &&
    hasRequiredMetadata(metadata, requiredFields?.title);

  const canUseBodyTemplate =
    t.has(`messages.${typeKey}.body` as Parameters<typeof t>[0]) &&
    hasRequiredMetadata(metadata, requiredFields?.body);

  const title = canUseTitleTemplate
    ? t(`messages.${typeKey}.title` as Parameters<typeof t>[0], metadata)
    : t.has("messages.fallback.title")
      ? t("messages.fallback.title")
      : notification.title;

  const body = notification.body
    ? canUseBodyTemplate
      ? t(`messages.${typeKey}.body` as Parameters<typeof t>[0], metadata)
      : notification.body
    : canUseBodyTemplate
      ? t(`messages.${typeKey}.body` as Parameters<typeof t>[0], metadata)
      : t.has("messages.fallback.body")
        ? t("messages.fallback.body")
        : undefined;

  return { title, body };
}