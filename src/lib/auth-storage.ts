/**
 * Authentication storage utilities
 * Centralized storage for JWT tokens with localStorage persistence
 * 
 * Storage Keys:
 * - auth_token: Access token (JWT)
 * - auth_refresh_token: Refresh token
 * 
 * Note: User data is decoded from JWT token, not stored separately
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Storage keys - consistent with AuthProvider
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

/**
 * Safe localStorage wrapper with SSR support
 */
class AuthStorage {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Save authentication tokens to localStorage
   * 
   * @param tokens - Access and refresh tokens
   * 
   * @example
   * ```ts
   * authStorage.setTokens({
   *   accessToken: 'jwt_token_here',
   *   refreshToken: 'refresh_token_here'
   * });
   * ```
   */
  setTokens(tokens: AuthTokens): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
    } catch (error) {
      console.error('[AuthStorage] Failed to save tokens:', error);
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
   * Get refresh token from localStorage
   * 
   * @returns Refresh token or null
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;

    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('[AuthStorage] Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get both tokens
   * 
   * @returns Token pair or null
   */
  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken: refreshToken || '',
    };
  }

  /**
   * Update only the access token (useful after refresh)
   * 
   * @param accessToken - New access token
   */
  updateAccessToken(accessToken: string): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } catch (error) {
      console.error('[AuthStorage] Failed to update access token:', error);
    }
  }

  /**
   * Clear all authentication data
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
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('[AuthStorage] Failed to clear auth data:', error);
    }
  }

  /**
   * Check if user has valid tokens stored
   * Note: This doesn't validate token expiration, use isTokenExpired() for that
   * 
   * @returns true if access token exists
   */
  hasTokens(): boolean {
    return !!this.getAccessToken();
  }
}

// Export singleton instance
export const authStorage = new AuthStorage();

// Backward compatibility - deprecated, use authStorage instead
/** @deprecated Use authStorage instead */
export const tokenStorage = {
  setTokens: (tokens: AuthTokens) => authStorage.setTokens(tokens),
  getAccessToken: () => authStorage.getAccessToken(),
  getRefreshToken: () => authStorage.getRefreshToken(),
  clearAuth: () => authStorage.clearAuth(),
  isAuthenticated: () => authStorage.hasTokens(),
};
