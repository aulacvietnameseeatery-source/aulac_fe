'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isTokenExpired, getUserInfo } from '@/lib/jwt-utils';
import { authStorage, AuthTokens } from '@/lib/auth-storage';

/**
 * Auth context shape
 */
interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  userInfo: ReturnType<typeof getUserInfo>;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAuth: () => void;
  updateAccessToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages JWT token state and persistence in localStorage
 * Integrates with backend authentication flow
 * 
 * @example
 * ```tsx
 * // In app layout
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tokens from localStorage on mount
  useEffect(() => {
    const tokens = authStorage.getTokens();
    
    if (tokens && !isTokenExpired(tokens.accessToken)) {
      setToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
    } else if (tokens) {
      // Remove expired tokens
      authStorage.clearAuth();
    }
    
    setIsInitialized(true);
  }, []);

  // Auto-logout on token expiration
  useEffect(() => {
    if (!token) return;

    const checkExpiration = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkExpiration);
  }, [token]);

  /**
   * Login user by storing JWT tokens
   * 
   * @param newToken - JWT access token from backend
   * @param newRefreshToken - Optional refresh token
   * 
   * @example
   * ```tsx
   * const handleLogin = async (credentials) => {
   *   const response = await loginAPI(credentials);
   *   login(response.data.accessToken, response.data.refreshToken);
   * };
   * ```
   */
  const login = useCallback((newToken: string, newRefreshToken?: string) => {
    if (isTokenExpired(newToken)) {
      console.error('[AuthProvider] Cannot login with expired token');
      return;
    }

    const tokens: AuthTokens = {
      accessToken: newToken,
      refreshToken: newRefreshToken || '',
    };

    authStorage.setTokens(tokens);
    setToken(newToken);
    setRefreshToken(newRefreshToken || null);
  }, []);

  /**
   * Update only the access token (useful after token refresh)
   * 
   * @param newToken - New access token
   * 
   * @example
   * ```tsx
   * // After refreshing token
   * const newAccessToken = await refreshTokenAPI();
   * updateAccessToken(newAccessToken);
   * ```
   */
  const updateAccessToken = useCallback((newToken: string) => {
    if (isTokenExpired(newToken)) {
      console.error('[AuthProvider] Cannot update with expired token');
      return;
    }

    authStorage.updateAccessToken(newToken);
    setToken(newToken);
  }, []);

  /**
   * Logout user by clearing all tokens
   * 
   * @example
   * ```tsx
   * <button onClick={logout}>Logout</button>
   * ```
   */
  const logout = useCallback(() => {
    authStorage.clearAuth();
    setToken(null);
    setRefreshToken(null);
  }, []);

  /**
   * Refresh auth state (re-read from localStorage)
   * Useful after external token updates
   */
  const refreshAuth = useCallback(() => {
    const tokens = authStorage.getTokens();
    
    if (tokens && !isTokenExpired(tokens.accessToken)) {
      setToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
    } else {
      setToken(null);
      setRefreshToken(null);
      if (tokens) {
        authStorage.clearAuth();
      }
    }
  }, []);

  const isAuthenticated = !!token && !isTokenExpired(token);
  const userInfo = getUserInfo(token);

  const value: AuthContextType = {
    token,
    refreshToken,
    isAuthenticated,
    userInfo,
    login,
    logout,
    refreshAuth,
    updateAccessToken,
  };

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 * 
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Please login</div>;
 *   }
 *   
 *   return <button onClick={logout}>Logout</button>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// NOTE: Frontend permissions are UX only - always validate on backend
