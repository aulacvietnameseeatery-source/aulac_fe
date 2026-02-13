/**
 * Rate Limit Hook
 * Tracks API rate limiting from response headers
 * 
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { mutate: login } = useLogin();
 *   const { isRateLimited, remainingAttempts, resetTime, handleRateLimitResponse } = useRateLimit();
 * 
 *   const handleSubmit = async () => {
 *     if (isRateLimited) {
 *       toast.error('Too many login attempts. Please try again later.');
 *       return;
 *     }
 *     
 *     login(credentials);
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {isRateLimited && (
 *         <div>Too many attempts. Try again at {resetTime?.toLocaleTimeString()}</div>
 *       )}
 *       {remainingAttempts !== null && (
 *         <div>Remaining attempts: {remainingAttempts}</div>
 *       )}
 *     </form>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';

interface RateLimitState {
  /**
   * Whether the user is currently rate limited
   */
  isRateLimited: boolean;
  
  /**
   * Number of remaining requests/attempts
   */
  remainingAttempts: number | null;
  
  /**
   * When the rate limit resets
   */
  resetTime: Date | null;
  
  /**
   * Total limit
   */
  limit: number | null;
}

/**
 * Hook to track rate limiting state from API responses
 * 
 * Reads standard rate limit headers:
 * - X-RateLimit-Limit: Total number of requests allowed
 * - X-RateLimit-Remaining: Number of requests remaining
 * - X-RateLimit-Reset: Unix timestamp when limit resets
 * 
 * @returns Rate limit state and handler function
 */
export function useRateLimit() {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    remainingAttempts: null,
    resetTime: null,
    limit: null,
  });

  /**
   * Parse rate limit headers from API response
   * Call this in your API error handler
   * 
   * @param headers - Response headers object or Headers instance
   * 
   * @example
   * ```ts
   * fetch('/api/login', options)
   *   .then(response => {
   *     handleRateLimitResponse(response.headers);
   *     return response.json();
   *   });
   * ```
   */
  const handleRateLimitResponse = useCallback((headers: Headers | Record<string, string>) => {
    const getHeader = (name: string): string | null => {
      if (headers instanceof Headers) {
        return headers.get(name);
      }
      return headers[name] || headers[name.toLowerCase()] || null;
    };

    const limit = getHeader('X-RateLimit-Limit');
    const remaining = getHeader('X-RateLimit-Remaining');
    const reset = getHeader('X-RateLimit-Reset');

    const remainingNum = remaining ? parseInt(remaining, 10) : null;
    const limitNum = limit ? parseInt(limit, 10) : null;
    const resetNum = reset ? parseInt(reset, 10) : null;

    setRateLimitState({
      isRateLimited: remainingNum === 0,
      remainingAttempts: remainingNum,
      resetTime: resetNum ? new Date(resetNum * 1000) : null,
      limit: limitNum,
    });
  }, []);

  /**
   * Manually set rate limited state
   * Useful for handling 429 responses
   * 
   * @param isLimited - Whether user is rate limited
   * @param resetTime - When to reset (optional)
   */
  const setRateLimited = useCallback((isLimited: boolean, resetTime?: Date) => {
    setRateLimitState(prev => ({
      ...prev,
      isRateLimited: isLimited,
      resetTime: resetTime || prev.resetTime,
    }));
  }, []);

  /**
   * Clear rate limit state
   */
  const clearRateLimit = useCallback(() => {
    setRateLimitState({
      isRateLimited: false,
      remainingAttempts: null,
      resetTime: null,
      limit: null,
    });
  }, []);

  /**
   * Get time remaining until reset in seconds
   */
  const getTimeUntilReset = useCallback((): number => {
    if (!rateLimitState.resetTime) return 0;
    
    const now = new Date();
    const diff = rateLimitState.resetTime.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }, [rateLimitState.resetTime]);

  return {
    ...rateLimitState,
    handleRateLimitResponse,
    setRateLimited,
    clearRateLimit,
    getTimeUntilReset,
  };
}
