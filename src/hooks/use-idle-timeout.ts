/**
 * Idle Timeout Hook
 * Automatically logs out user after period of inactivity
 * 
 * @example
 * ```tsx
 * // In AuthProvider or App component
 * function App() {
 *   const { logout } = useAuth();
 * 
 *   useIdleTimeout({
 *     timeout: 15 * 60 * 1000, // 15 minutes
 *     onIdle: () => {
 *       logout();
 *       toast.warning('You have been logged out due to inactivity');
 *     },
 *   });
 * 
 *   return <div>...</div>;
 * }
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  /**
   * Timeout duration in milliseconds
   * @default 900000 (15 minutes)
   */
  timeout?: number;
  
  /**
   * Callback when user becomes idle
   */
  onIdle: () => void;
  
  /**
   * Events to track for activity
   * @default ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
   */
  events?: string[];

  /**
   * Whether to enable idle timeout
   * @default true
   */
  enabled?: boolean;

  /**
   * Optional callback when timer resets (user is active)
   */
  onActivity?: () => void;
}

/**
 * Hook to detect user inactivity and trigger callback
 * 
 * @param options - Configuration options
 */
export function useIdleTimeout({
  timeout = 15 * 60 * 1000, // 15 minutes default
  onIdle,
  events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'],
  enabled = true,
  onActivity,
}: UseIdleTimeoutOptions) {
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastActivityTime = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    // Update last activity time
    lastActivityTime.current = Date.now();

    // Call activity callback
    if (onActivity) {
      onActivity();
    }

    // Set new timeout
    timeoutId.current = setTimeout(() => {
      console.log('[IdleTimeout] User idle, triggering callback');
      onIdle();
    }, timeout);
  }, [onIdle, timeout, enabled, onActivity]);

  useEffect(() => {
    if (!enabled) {
      // Clear timeout if disabled
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      return;
    }

    // Set initial timeout
    resetTimer();

    // Add event listeners for user activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [events, resetTimer, enabled]);

  /**
   * Get time remaining until timeout
   */
  const getTimeRemaining = useCallback(() => {
    if (!enabled) return 0;
    
    const elapsed = Date.now() - lastActivityTime.current;
    const remaining = timeout - elapsed;
    return remaining > 0 ? remaining : 0;
  }, [timeout, enabled]);

  /**
   * Manually reset the idle timer
   */
  const reset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    reset,
    getTimeRemaining,
  };
}
