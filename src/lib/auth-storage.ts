/**
 * Authentication storage utilities
 * Centralized storage for JWT access tokens with localStorage persistence
 * 
 * Storage Keys:
 * - auth_token: Access token (JWT)
 * 
 * Note: 
 * - Refresh tokens are stored in HttpOnly cookies by the backend (XSS protection)
 * - User data is decoded from JWT token, not stored separately
 */

export interface AuthTokens {
  accessToken: string;
  // refreshToken removed - managed by browser via HttpOnly cookie
}

// Storage keys - consistent with AuthProvider
const TOKEN_KEY = 'auth_token';
// REFRESH_TOKEN_KEY removed - refresh token is in HttpOnly cookie

/**
 * Safe localStorage wrapper with SSR support
 */
class AuthStorage {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Save access token to localStorage
   * Note: Refresh token is managed by backend in HttpOnly cookie
   * 
   * @param accessToken - JWT access token
   * 
   * @example
   * ```ts
   * authStorage.setAccessToken('jwt_token_here');
   * ```
   */
  setAccessToken(accessToken: string): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } catch (error) {
      console.error('[AuthStorage] Failed to save access token:', error);
    }
  }

  /**
   * Get access token from localStorage
   * 
   * @returns Access token or null
   */
  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;

    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('[AuthStorage] Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Check if access token exists
   * 
   * @returns true if token exists
   */
  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Clear all authentication data
   * Note: HttpOnly cookie is cleared by backend on logout
   * 
   * @example
   * ```ts
   * // On logout
   * authStorage.clearAuth();
   * ```
   */
  clearAuth(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      // HttpOnly cookie cannot be cleared by JavaScript
      // Backend must clear it via /api/auth/logout endpoint
    } catch (error) {
      console.error('[AuthStorage] Failed to clear auth data:', error);
    }
  }
}

// Export singleton instance
export const authStorage = new AuthStorage();

// Backward compatibility - deprecated, use authStorage instead
/** @deprecated Use authStorage instead */
export const tokenStorage = {
  setAccessToken: (token: string) => authStorage.setAccessToken(token),
  getAccessToken: () => authStorage.getAccessToken(),
  clearAuth: () => authStorage.clearAuth(),
  isAuthenticated: () => authStorage.hasToken(),
};
