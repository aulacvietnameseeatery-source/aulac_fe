"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "@/components/providers/auth-provider";
import { authStorage } from "@/lib/auth-storage";
import { acquireConnection, releaseConnection, waitForStart } from "@/lib/signalr";
import { SIGNALR_EVENT_RECEIVE } from "../constants/notification.constants";
import { useNotificationStore } from "../store/notification.store";
import { notificationService } from "../services/notification.service";
import type { NotificationDto } from "../types/notification.types";

/** Hub path constant — shared with other features that piggyback on the same connection. */
export const RESTAURANT_HUB = "/hubs/restaurant";

interface NotificationContextType {
  connectionRef: React.RefObject<signalR.HubConnection | null>;
}

declare global {
  interface Window {
    __notificationDebug?: {
      hubUrl: string;
      getStoreState: () => ReturnType<typeof useNotificationStore.getState>;
      getConnectionState: () => signalR.HubConnectionState;
      connectionId: () => string | null;
    };
  }
}

const NotificationContext = createContext<NotificationContextType>({
  connectionRef: { current: null },
});

export const useNotificationConnection = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { addNotification, mergeMissed, setConnected, setUnreadCount, setPreferences } =
    useNotificationStore();
  const isDev = process.env.NODE_ENV === "development";

  // Track login/logout transitions only (not token refresh).
  // accessTokenFactory reads the latest token from localStorage on each reconnect,
  // so we only need to react when "logged in" ↔ "logged out" changes.
  const isLoggedIn = !!token;

  // Lấy unread count và preferences từ REST khi provider mount
  const fetchInitialData = useCallback(async () => {
    try {
      const [count, prefs] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getPreferences(),
      ]);
      setUnreadCount(count);
      setPreferences(prefs);
    } catch (err) {
      console.warn("[NotificationProvider] Failed to fetch initial data:", err);
    }
  }, [setUnreadCount, setPreferences]);

  // Khôi phục thông báo bị lỡ khi reconnect
  const recoverMissed = useCallback(async () => {
    const after = useNotificationStore.getState().lastReceivedAt;
    if (!after) return;

    try {
      const missed = await notificationService.getMissed(after);
      if (missed.length > 0) {
        mergeMissed(missed);
      }
    } catch (err) {
      console.warn("[NotificationProvider] Failed to recover missed:", err);
    }
  }, [mergeMissed]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Acquire singleton connection — reuses existing if already connected
    const connection = acquireConnection(RESTAURANT_HUB, {
      accessTokenFactory: () => authStorage.getAccessToken() ?? "",
    });

    connectionRef.current = connection;

    if (isDev && typeof window !== "undefined") {
      window.__notificationDebug = {
        hubUrl: RESTAURANT_HUB,
        getStoreState: () => useNotificationStore.getState(),
        getConnectionState: () => connection.state,
        connectionId: () => connection.connectionId,
      };
      console.info("[NotificationProvider] Debug helper ready: window.__notificationDebug");
    }

    // Handle incoming notifications (removable via .off)
    const onReceive = (notification: NotificationDto) => {
      addNotification(notification);
    };
    connection.on(SIGNALR_EVENT_RECEIVE, onReceive);

    // Lifecycle handlers — use named functions so we can avoid duplicates.
    // SignalR's onreconnecting/onreconnected/onclose are ADDITIVE (not replaceable),
    // so we must guard against duplicate registration.
    const onReconnecting = () => {
      console.info("[NotificationProvider] Reconnecting...");
      setConnected(false);
    };
    const onReconnected = () => {
      console.info("[NotificationProvider] Reconnected", {
        connectionId: connection.connectionId,
      });
      setConnected(true);
      recoverMissed();
    };
    const onClose = (err?: Error) => {
      console.info("[NotificationProvider] Closed", {
        reason: err?.message ?? "normal-close",
      });
      setConnected(false);
    };

    // SignalR JS client doesn't expose removeOnReconnecting/etc, so we use
    // a wrapper flag to prevent stale handlers from executing after cleanup.
    let active = true;
    connection.onreconnecting(() => { if (active) onReconnecting(); });
    connection.onreconnected(() => { if (active) onReconnected(); });
    connection.onclose((err) => { if (active) onClose(err); });

    // Wait for singleton start, then fetch initial data
    waitForStart(RESTAURANT_HUB)
      .then(() => {
        if (!active) return;
        if (isDev) {
          console.info("[NotificationProvider] Connected", {
            hubUrl: RESTAURANT_HUB,
            connectionId: connection.connectionId,
          });
        }
        setConnected(true);
        fetchInitialData();
      })
      .catch(() => {
        if (active) setConnected(false);
      });

    return () => {
      active = false;
      connection.off(SIGNALR_EVENT_RECEIVE, onReceive);
      releaseConnection(RESTAURANT_HUB);
      connectionRef.current = null;
      if (isDev && typeof window !== "undefined") {
        delete window.__notificationDebug;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <NotificationContext.Provider value={{ connectionRef }}>
      {children}
    </NotificationContext.Provider>
  );
}
