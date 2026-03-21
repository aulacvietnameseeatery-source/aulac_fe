"use client";

import { Toaster } from "sonner";

/**
 * Dedicated Sonner <Toaster> instance for notification toasts only.
 * Renders in the top-right corner, separate from the app-wide Toaster
 * (which sits at top-center for success/error/info toasts).
 *
 * The toast renderer publishes to this instance via `toast.custom(…)`
 * — Sonner routes custom toasts to the last-matching Toaster.
 * We give this one a unique `toastOptions.className` wrapper so
 * notification toasts never collide with app toasts.
 */
export function NotificationToaster() {
  return (
    <Toaster
      id="notification"
      position="top-left"
      // Separate visual stacking from the default app toaster
      className="notification-toaster"
      // Only show up to 3 notification toasts stacked
      visibleToasts={3}
      // Gap between stacked toasts
      gap={8}
      toastOptions={{
        classNames: {
          toast: "!p-0 !bg-transparent !border-none !shadow-none",
        },
      }}
    />
  );
}
