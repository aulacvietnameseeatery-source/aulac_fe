'use client';

import React from 'react';

interface ConnectionStatusProps {
    isConnected: boolean;
    error?: string | null;
}

/**
 * Visual indicator for SignalR connection status
 * Shows a small dot with tooltip indicating real-time connection state
 */
export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
    return (
        <div className="flex items-center gap-2 text-xs text-stone-500">
            <div className="relative group">
                <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${isConnected
                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                        : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                        }`}
                    aria-label={isConnected ? 'Connected' : 'Disconnected'}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {isConnected
                        ? '🟢 Real-time updates active'
                        : error
                            ? `🔴 Error: ${error}`
                            : '🟡 Reconnecting...'}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                </div>
            </div>

            <span className="hidden sm:inline">
                {isConnected ? 'Live' : 'Reconnecting'}
            </span>
        </div>
    );
}
