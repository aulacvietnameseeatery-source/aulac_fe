'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

type SignalRContextType = {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
};

const SignalRContext = createContext<SignalRContextType>({
    connection: null,
    isConnected: false,
});

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083";
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/hubs/reservation`)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection
                .start()
                .then(() => {
                    console.log('SignalR Connected');
                    setIsConnected(true);
                })
                .catch((err) => console.error('SignalR Connection Error: ', err));

            connection.onreconnecting(() => setIsConnected(false));
            connection.onreconnected(() => setIsConnected(true));

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    return (
        <SignalRContext.Provider value={{ connection, isConnected }}>
            {children}
        </SignalRContext.Provider>
    );
};
