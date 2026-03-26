"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "@/components/providers/auth-provider";
import { authStorage } from "@/lib/auth-storage";
import { BASE_URL } from "@/lib/http";
import { SIGNALR_EVENT_RECEIVE } from "../constants/notification.constants";
import { useNotificationStore } from "../store/notification.store";
import { notificationService } from "../services/notification.service";
import type { NotificationDto } from "../types/notification.types";

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
    if (!token) return;

    let destroyed = false;
    const hubUrl = `${BASE_URL}/hubs/restaurant`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => authStorage.getAccessToken() ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    if (isDev && typeof window !== "undefined") {
      window.__notificationDebug = {
        hubUrl,
        getStoreState: () => useNotificationStore.getState(),
        getConnectionState: () => connection.state,
        connectionId: () => connection.connectionId,
      };
      console.info("[NotificationProvider] Debug helper ready: window.__notificationDebug");
    }

    // Handle incoming notifications
    connection.on(SIGNALR_EVENT_RECEIVE, (notification: NotificationDto) => {
      addNotification(notification);
    });

    // Connection state handlers
    connection.onreconnecting(() => {
      if (isDev) {
        console.info("[NotificationProvider] Reconnecting...");
      }
      setConnected(false);
    });

    connection.onreconnected(() => {
      if (isDev) {
        console.info("[NotificationProvider] Reconnected", {
          connectionId: connection.connectionId,
        });
      }
      setConnected(true);
      recoverMissed();
    });

    connection.onclose((err) => {
      if (isDev) {
        console.info("[NotificationProvider] Closed", {
          reason: err?.message ?? "normal-close",
        });
      }
      setConnected(false);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        if (destroyed) return;
        if (isDev) {
          console.info("[NotificationProvider] Connected", {
            hubUrl,
            connectionId: connection.connectionId,
          });
        }
        setConnected(true);
        fetchInitialData();
      })
      .catch((err) => {
        // `destroyed` means cleanup ran before start() resolved (React StrictMode double-invoke) — ignore
        if (destroyed) return;
        console.warn("[NotificationProvider] Connection failed:", err);
        setConnected(false);
      });

    return () => {
      destroyed = true;
      connection.stop();
      connectionRef.current = null;
      if (isDev && typeof window !== "undefined") {
        delete window.__notificationDebug;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <NotificationContext.Provider value={{ connectionRef }}>
      {children}
    </NotificationContext.Provider>
  );
}
