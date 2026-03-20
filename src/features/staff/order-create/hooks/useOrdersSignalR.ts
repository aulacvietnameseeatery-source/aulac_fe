// src/features/orders/hooks/useOrdersSignalR.ts
import { useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import { UseOrdersSignalRProps, OrderRealtimeDTO } from '../types/order-realtime.types';
import { BASE_URL } from '@/lib/http';

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
    const hubUrl = `${BASE_URL}/hubs/reservation`;
    
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    const startSignalR = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        console.log("SignalR Connected to ReservationHub");
        
        // Đăng ký vào group
        await connection.invoke("JoinOrders");

        // Lắng nghe events
        connection.on("OrderCreated", (data: OrderRealtimeDTO) => {
          if (onOrderCreatedRef.current) onOrderCreatedRef.current(data);
        });

        connection.on("OrderUpdated", (data: OrderRealtimeDTO) => {
          if (onOrderUpdatedRef.current) onOrderUpdatedRef.current(data);
        });

      } catch (error) {
        console.error("SignalR Connection Error:", error);
        setIsConnected(false);
      }
    };

    startSignalR();

    // Cleanup khi component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("OrderCreated");
        connectionRef.current.off("OrderUpdated");
        connectionRef.current.stop();
      }
    };
  }, []); 

  return { isConnected };
};