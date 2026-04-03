"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "@/routing";
import { toast } from "sonner";

const AUTO_LOGOUT_KEY = "shift_checkout_auto_logout_at";
const AUTO_LOGOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface UseCheckoutAutoLogoutReturn {
  /** Whether the countdown is active */
  isCountingDown: boolean;
  /** Remaining seconds (0 when not active) */
  remainingSeconds: number;
  /** Formatted "mm:ss" string */
  remainingLabel: string;
  /** Start the countdown (call after successful check-out) */
  startCountdown: () => void;
  /** Cancel the countdown ("Stay" button) */
  cancelCountdown: () => void;
  /** Logout immediately */
  logoutNow: () => void;
}

/**
 * Hook to manage auto-logout countdown after shift check-out.
 *
 * After a successful check-out:
 * 1. Starts a 5-minute countdown persisted in localStorage
 * 2. Shows a persistent banner with remaining time
 * 3. User can cancel ("Stay") or logout immediately
 * 4. When countdown reaches 0 → forces logout + redirect to /login
 *
 * Survives page refresh via localStorage.
 */
export function useCheckoutAutoLogout(): UseCheckoutAutoLogoutReturn {
  const { logout } = useAuth();
  const router = useRouter();
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount, check localStorage for an active countdown
  useEffect(() => {
    const stored = localStorage.getItem(AUTO_LOGOUT_KEY);
    if (stored) {
      const target = parseInt(stored, 10);
      if (!isNaN(target) && target > Date.now()) {
        setTargetTime(target);
      } else if (!isNaN(target) && target <= Date.now()) {
        // Countdown expired while away — logout immediately
        localStorage.removeItem(AUTO_LOGOUT_KEY);
        performLogout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performLogout = useCallback(async () => {
    localStorage.removeItem(AUTO_LOGOUT_KEY);
    setTargetTime(null);
    setRemainingSeconds(0);
    await logout();
    router.push("/login");
  }, [logout, router]);

  // Tick the countdown every second
  useEffect(() => {
    if (targetTime === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        performLogout();
      }
    };

    tick(); // immediate first tick
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTime, performLogout]);

  const startCountdown = useCallback(() => {
    const target = Date.now() + AUTO_LOGOUT_DURATION_MS;
    localStorage.setItem(AUTO_LOGOUT_KEY, String(target));
    setTargetTime(target);
  }, []);

  const cancelCountdown = useCallback(() => {
    localStorage.removeItem(AUTO_LOGOUT_KEY);
    setTargetTime(null);
    setRemainingSeconds(0);
    toast.info("Auto-logout cancelled. You can continue working.");
  }, []);

  const logoutNow = useCallback(() => {
    performLogout();
  }, [performLogout]);

  const isCountingDown = targetTime !== null && remainingSeconds > 0;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const remainingLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    isCountingDown,
    remainingSeconds,
    remainingLabel,
    startCountdown,
    cancelCountdown,
    logoutNow,
  };
}
