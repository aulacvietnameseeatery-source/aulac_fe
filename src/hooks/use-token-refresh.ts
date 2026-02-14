/**
 * Automatic Token Refresh Hook
 * Proactively refreshes access tokens before they expire
 * 
 * @example
 * ```tsx
 * // In AuthProvider
 * function AuthProvider({ children }) {
 *   const { token, refreshToken, updateAccessToken } = useAuth();
 * 
 *   useTokenRefresh({
 *     token,
 *     refreshToken,
 *     onRefresh: async (refreshToken) => {
 *       const response = await authService.refreshToken(refreshToken);
 *       return response.data.accessToken;
 *     },
 *     onSuccess: (newToken) => {
 *       updateAccessToken(newToken);
 *     },
 *     onError: () => {
 *       logout();
 *     },
 *   });
 * 
 *   return <div>...</div>;
 * }
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { getTokenExpirationTime, isTokenExpired } from '@/lib/jwt-utils';

interface UseTokenRefreshOptions {
  /**
   * Current access token
   */
  token: string | null;
  
  /**
   * Function to call to refresh the token
   * Should return the new access token
   * Note: Refresh token is sent automatically via HttpOnly cookie
   */
  onRefresh: (currentAccessToken: string) => Promise<string>;
  
  /**
   * Called when token is successfully refreshed
   */
  onSuccess: (newToken: string) => void;
  
  /**
   * Called when refresh fails
   */
  onError: (error: Error) => void;
  
  /**
   * How many seconds before expiration to refresh
   * @default 300 (5 minutes)
   */
  refreshBufferSeconds?: number;
  
  /**
   * Whether to enable automatic refresh
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook to automatically refresh tokens before they expire
 * 
 * Features:
 * - Schedules refresh based on token expiration time
 * - Refreshes token before it expires (5 min buffer by default)
 * - Handles refresh failures gracefully
 * - Prevents multiple concurrent refreshes
 * 
 * @param options - Configuration options
 */
export function useTokenRefresh({
  token,
  onRefresh,
  onSuccess,
  onError,
  refreshBufferSeconds = 150, // 3 minutes
  enabled = true,
}: UseTokenRefreshOptions) {
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);
  const isRefreshing = useRef(false);

  /**
   * Schedule the next token refresh
   */
  const scheduleRefresh = useCallback(() => {
    // Clear existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = undefined;
    }

    if (!enabled || !token) {
      return;
    }

    // Check if token is already expired
    if (isTokenExpired(token)) {
      console.warn('[TokenRefresh] Token already expired, skipping schedule');
      return;
    }

    // Get time until expiration
    const expiresInSeconds = getTokenExpirationTime(token);
    
    if (expiresInSeconds === 0) {
      console.warn('[TokenRefresh] Token has no valid expiration time');
      return;
    }

    // Calculate when to refresh (buffer seconds before expiration)
    const refreshInSeconds = Math.max(30, expiresInSeconds - refreshBufferSeconds);
    const refreshInMs = refreshInSeconds * 1000;
    // Schedule the refresh
    timeoutId.current = setTimeout(async () => {
      await performRefresh();
    }, refreshInMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshBufferSeconds, enabled]); // performRefresh is stable

  /**
   * Perform the actual token refresh
   */
  const performRefresh = useCallback(async () => {
    if (isRefreshing.current) {
      console.log('[TokenRefresh] Refresh already in progress, skipping');
      return;
    }

    if (!token) {
      console.error('[TokenRefresh] No access token available');
      return;
    }

    isRefreshing.current = true;

    try {
      console.log('[TokenRefresh] Refreshing access token...');
      
      const newToken = await onRefresh(token);
      
      console.log('[TokenRefresh] Token refreshed successfully');
      onSuccess(newToken);
      
      // Schedule next refresh
      // Note: We need to wait for the new token to be set in state
      // before scheduling the next refresh
      setTimeout(() => {
        scheduleRefresh();
      }, 1000);
      
    } catch (error) {
      console.error('[TokenRefresh] Failed to refresh token:', error);
      onError(error instanceof Error ? error : new Error('Token refresh failed'));
    } finally {
      isRefreshing.current = false;
    }
  }, [token, onRefresh, onSuccess, onError, scheduleRefresh]);

  /**
   * Manually trigger a token refresh
   */
  const refresh = useCallback(async () => {
    await performRefresh();
  }, [performRefresh]);

  // Set up automatic refresh scheduling
  useEffect(() => {
    if (enabled && token) {
      scheduleRefresh();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
    };
  }, [token, enabled, scheduleRefresh]);

  return {
    /**
     * Manually trigger a token refresh
     */
    refresh,
    
    /**
     * Whether a refresh is currently in progress
     */
    isRefreshing: isRefreshing.current,
  };
}
