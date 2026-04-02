'use client';
// This is now handled by the global NotificationProvider singleton.
// Use useNotificationConnection() from @/features/staff/notifications instead.
//
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import * as signalR from '@microsoft/signalr';
// import { authStorage } from '@/lib/auth-storage';
// import { acquireConnection, releaseConnection, waitForStart } from '@/lib/signalr';
//
// type SignalRContextType = {
//     connection: signalR.HubConnection | null;
//     isConnected: boolean;
// };
//
// const RESTAURANT_HUB = '/hubs/restaurant';
//
// const SignalRContext = createContext<SignalRContextType>({
//     connection: null,
//     isConnected: false,
// });
//
// export const useSignalR = () => useContext(SignalRContext);
//
// export const SignalRProvider = ({ children }: { children: React.ReactNode }) => { ... };

export {
  useNotificationConnection as useSignalR,
} from "@/features/staff/notifications";
