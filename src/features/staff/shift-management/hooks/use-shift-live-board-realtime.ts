"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNotificationConnection,
  useNotificationStore,
} from "@/features/staff/notifications";
import { SHIFT_QUERY_KEYS } from "./use-shift-queries";
import type { ShiftLiveRealtimeEventDto } from "../types/shift-management.types";

const SHIFT_LIVE_EVENT = "ShiftLiveBoardChanged";

export function useShiftLiveBoardRealtime(workDate?: string) {
  const queryClient = useQueryClient();
  const { connectionRef } = useNotificationConnection();
  const connected = useNotificationStore((state) => state.connected);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connected || !connection) {
      return;
    }

    const invalidateBoard = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["shifts", "live-board"] });
        queryClient.invalidateQueries({ queryKey: ["shifts", "live-operations"] });
      }, 350);
    };

    const handleBoardChange = (payload: ShiftLiveRealtimeEventDto) => {
      if (workDate && payload.workDate && payload.workDate !== workDate) {
        return;
      }

      invalidateBoard();
    };

    connection.on(SHIFT_LIVE_EVENT, handleBoardChange);

    return () => {
      connection.off(SHIFT_LIVE_EVENT, handleBoardChange);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [connected, connectionRef, queryClient, workDate]);

  return {
    isRealtimeConnected: connected && !!connectionRef.current,
  };
}