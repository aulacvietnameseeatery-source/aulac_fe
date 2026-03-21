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

const NotificationContext = createContext<NotificationContextType>({
  connectionRef: { current: null },
});

export const useNotificationConnection = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { addNotification, mergeMissed, setConnected, setUnreadCount, setPreferences } =
    useNotificationStore();

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

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/restaurant`, {
        accessTokenFactory: () => authStorage.getAccessToken() ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Handle incoming notifications
    connection.on(SIGNALR_EVENT_RECEIVE, (notification: NotificationDto) => {
      addNotification(notification);
    });

    // Connection state handlers
    connection.onreconnecting(() => {
      setConnected(false);
    });

    connection.onreconnected(() => {
      setConnected(true);
      recoverMissed();
    });

    connection.onclose(() => {
      setConnected(false);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        setConnected(true);
        fetchInitialData();
      })
      .catch((err) => {
        console.error("[NotificationProvider] Connection failed:", err);
        setConnected(false);
      });

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <NotificationContext.Provider value={{ connectionRef }}>
      {children}
    </NotificationContext.Provider>
  );
}
