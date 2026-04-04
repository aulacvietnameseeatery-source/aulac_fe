import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export const ZURICH_TZ = "Europe/Zurich";

/**
 * Convert a date string ("2025-04-04") + time string ("22:30")
 * → UTC ISO string, interpreting date+time as Europe/Zurich.
 *
 * Handles DST transitions correctly (CET ↔ CEST).
 */
export function zurichToUtcISO(dateStr: string, timeStr: string): string {
  // "2025-04-04 22:30" interpreted as Zurich local
  const zurichLocal = `${dateStr}T${timeStr}:00`;
  const utcDate = fromZonedTime(zurichLocal, ZURICH_TZ);
  return utcDate.toISOString();
}

/**
 * Get current Date object in Zurich timezone.
 */
export function getZurichNow(): Date {
  return toZonedTime(new Date(), ZURICH_TZ);
}

/**
 * Get today's date string in Zurich timezone: "YYYY-MM-DD".
 */
export function getZurichTodayStr(): string {
  const zurichNow = getZurichNow();
  return format(zurichNow, "yyyy-MM-dd");
}

/**
 * Current time in minutes since midnight, in Zurich timezone.
 */
export function getZurichCurrentMinutes(): number {
  const zurichNow = getZurichNow();
  return zurichNow.getHours() * 60 + zurichNow.getMinutes();
}

/**
 * Check if a date+time combo is in the past according to Zurich timezone.
 * Includes a configurable buffer (default: 15 minutes).
 */
export function isZurichTimePast(
  dateStr: string,
  timeStr: string,
  bufferMinutes = 15,
): boolean {
  if (!dateStr || !timeStr) return false;
  const zurichNow = getZurichNow();
  const [h, m] = timeStr.split(":").map(Number);

  const zurichSelected = toZonedTime(
    fromZonedTime(`${dateStr}T${timeStr}:00`, ZURICH_TZ),
    ZURICH_TZ,
  );

  const nowWithBuffer = new Date(zurichNow.getTime() + bufferMinutes * 60_000);
  return zurichSelected.getTime() <= nowWithBuffer.getTime();
}

/**
 * Format a UTC ISO string to Zurich local display: "dd/MM/yyyy".
 */
export function formatZurichDate(utcISO: string): string {
  const zurich = toZonedTime(new Date(utcISO), ZURICH_TZ);
  return format(zurich, "dd/MM/yyyy");
}

/**
 * Format a UTC ISO string to Zurich local time: "HH:mm".
 */
export function formatZurichTime(utcISO: string): string {
  const zurich = toZonedTime(new Date(utcISO), ZURICH_TZ);
  return format(zurich, "HH:mm");
}

/**
 * Format a UTC ISO string to full Zurich display: "dd/MM/yyyy HH:mm".
 */
export function formatZurichDateTime(utcISO: string): string {
  const zurich = toZonedTime(new Date(utcISO), ZURICH_TZ);
  return format(zurich, "dd/MM/yyyy HH:mm");
}
