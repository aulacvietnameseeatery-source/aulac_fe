// src/features/orders/hooks/useOrdersSignalR.ts
import { useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { UseOrdersSignalRProps, OrderRealtimeDTO, OrderItemRealtimeDTO } from '../types/order-realtime.types';
import { acquireConnection, releaseConnection, waitForStart } from '@/lib/signalr';
import { authStorage } from '@/lib/auth-storage';

const HUB_PATH = '/hubs/restaurant';

export const useOrdersSignalR = ({ activeOrderId, onOrderCreated, onOrderUpdated, onOrderDetailUpdated, onOrderItemUpdated }: UseOrdersSignalRProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  // Dùng refs để lưu callback mới nhất, tránh trigger useEffect của SignalR
  const callbacksRef = useRef({ onOrderCreated, onOrderUpdated, onOrderDetailUpdated, onOrderItemUpdated });

  useEffect(() => {
    callbacksRef.current = { onOrderCreated, onOrderUpdated, onOrderDetailUpdated, onOrderItemUpdated };
  }, [onOrderCreated, onOrderUpdated, onOrderDetailUpdated, onOrderItemUpdated]);

  useEffect(() => {
    const connection = acquireConnection(HUB_PATH, {
      accessTokenFactory: () => authStorage.getAccessToken() ?? '',
    });
    connectionRef.current = connection;

    const onCreated = (data: OrderRealtimeDTO) => callbacksRef.current.onOrderCreated?.(data);
    const onUpdated = (data: OrderRealtimeDTO) => callbacksRef.current.onOrderUpdated?.(data);
    const onDetailUpdated = (data: OrderRealtimeDTO) => callbacksRef.current.onOrderDetailUpdated?.(data);
    const onIemUpdated = (data: OrderItemRealtimeDTO) => callbacksRef.current.onOrderItemUpdated?.(data);

    waitForStart(HUB_PATH)
      .then(async () => {
        setIsConnected(true);

        // Đăng ký vào group
        await connection.invoke("JoinOrders");

        // Lắng nghe events
        connection.on("OrderCreated", onCreated);
        connection.on("OrderUpdated", onUpdated);
        connection.on("OrderDetailUpdated", onDetailUpdated);
        connection.on("OrderItemUpdated", onIemUpdated);
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
        connectionRef.current.off("OrderDetailUpdated", onDetailUpdated);
        connectionRef.current.off("OrderItemUpdated", onIemUpdated);
      }
      releaseConnection(HUB_PATH);
    };
  }, []); 

  // Xử lý Join/Leave Group khi activeOrderId thay đổi
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected || !activeOrderId) return;

    connection.invoke("JoinOrder", activeOrderId).catch(console.error);

    return () => {
      connection.invoke("LeaveOrder", activeOrderId).catch(console.error);
    };
  }, [activeOrderId, isConnected]);

  return { isConnected };
};