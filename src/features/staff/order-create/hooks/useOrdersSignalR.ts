// src/features/orders/hooks/useOrdersSignalR.ts
import { useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { UseOrdersSignalRProps, OrderRealtimeDTO } from '../types/order-realtime.types';
import { acquireConnection, releaseConnection, waitForStart } from '@/lib/signalr';
import { authStorage } from '@/lib/auth-storage';

const HUB_PATH = '/hubs/restaurant';

export const useOrdersSignalR = ({ onOrderCreated, onOrderUpdated }: UseOrdersSignalRProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  // Dùng refs để lưu callback mới nhất, tránh trigger useEffect của SignalR
  const onOrderCreatedRef = useRef(onOrderCreated);
  const onOrderUpdatedRef = useRef(onOrderUpdated);

  useEffect(() => {
    onOrderCreatedRef.current = onOrderCreated;
    onOrderUpdatedRef.current = onOrderUpdated;
  }, [onOrderCreated, onOrderUpdated]);

  useEffect(() => {
    const connection = acquireConnection(HUB_PATH, {
      accessTokenFactory: () => authStorage.getAccessToken() ?? '',
    });
    connectionRef.current = connection;

    const onCreated = (data: OrderRealtimeDTO) => {
      if (onOrderCreatedRef.current) onOrderCreatedRef.current(data);
    };
    const onUpdated = (data: OrderRealtimeDTO) => {
      if (onOrderUpdatedRef.current) onOrderUpdatedRef.current(data);
    };

    waitForStart(HUB_PATH)
      .then(async () => {
        setIsConnected(true);

        // Đăng ký vào group
        await connection.invoke("JoinOrders");

        // Lắng nghe events
        connection.on("OrderCreated", onCreated);
        connection.on("OrderUpdated", onUpdated);
      })
      .catch((error) => {
        console.error("SignalR Connection Error:", error);
        setIsConnected(false);
      });

    // Cleanup khi component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("OrderCreated", onCreated);
        connectionRef.current.off("OrderUpdated", onUpdated);
      }
      releaseConnection(HUB_PATH);
    };
  }, []); 

  return { isConnected };
};