'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isTokenExpired, getUserInfo } from '@/lib/jwt-utils';
import { authStorage } from '@/lib/auth-storage';
import { authSync } from '@/lib/auth-sync';
import { CSRFProtection } from '@/lib/csrf';
import { useTokenRefresh } from '@/hooks/use-token-refresh';

/**
 * Auth context shape
 */
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: ReturnType<typeof getUserInfo>;
  login: (token: string) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize token from localStorage on mount
  // Refresh token is in HttpOnly cookie, managed by browser
  useEffect(() => {
    const accessToken = authStorage.getAccessToken();
    
    if (accessToken && !isTokenExpired(accessToken)) {
      setToken(accessToken);
      // Generate CSRF token on auth init
      CSRFProtection.getToken();
    } else if (accessToken) {
      // Remove expired token
      authStorage.clearAuth();
      CSRFProtection.clearToken();
    }
    
    setIsInitialized(true);
  }, []);

  // Cross-tab authentication synchronization
  useEffect(() => {
    const unsubscribe = authSync.subscribe((event) => {
      if (event.type === 'LOGIN' && event.token) {
        // Sync login from another tab
        const accessToken = authStorage.getAccessToken();
        if (accessToken && !isTokenExpired(accessToken)) {
          setToken(accessToken);
        }
      } else if (event.type === 'LOGOUT') {
        // Sync logout from another tab
        setToken(null);
      } else if (event.type === 'TOKEN_UPDATE') {
        // Sync token update from another tab
        const accessToken = authStorage.getAccessToken();
        if (accessToken) {
          setToken(accessToken);
        }
      }
    });

    return () => unsubscribe();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // logout is stable, doesn't need to be in deps

  /**
   * Login user by storing JWT access token
   * Refresh token is automatically stored in HttpOnly cookie by backend
   * 
   * @param newToken - JWT access token from backend
   * 
   * @example
   * ```tsx
   * const handleLogin = async (credentials) => {
   *   const response = await loginAPI(credentials);
   *   login(response.data.accessToken);
   * };
   * ```
   */
  const login = useCallback((newToken: string) => {
    if (isTokenExpired(newToken)) {
      console.error('[AuthProvider] Cannot login with expired token');
      return;
    }

    authStorage.setAccessToken(newToken);
    setToken(newToken);

    // Generate CSRF token on login
    CSRFProtection.generateToken();

    // Broadcast login to other tabs
    authSync.broadcast({
      type: 'LOGIN',
      timestamp: Date.now(),
      token: newToken,
    });
  }, []);

  /**
   * Update access token after refresh
   * Refresh token is automatically rotated in HttpOnly cookie by backend
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

    authStorage.setAccessToken(newToken);
    setToken(newToken);

    // Broadcast token update to other tabs
    authSync.broadcast({
      type: 'TOKEN_UPDATE',
      timestamp: Date.now(),
      token: newToken,
    });
  }, []);

  /**
   * Logout user by clearing access token
   * Backend clears HttpOnly refresh token cookie via logout endpoint
   * 
   * @example
   * ```tsx
   * <button onClick={logout}>Logout</button>
   * ```
   */
  const logout = useCallback(async () => {
    // Call backend to clear HttpOnly cookie
    try {
      const { authService } = await import('@/features/customer/auth/login/services/login.api');
      await authService.logout();
    } catch (error) {
      console.error('[AuthProvider] Logout API failed:', error);
      // Continue with local cleanup
    }

    authStorage.clearAuth();
    setToken(null);

    // Clear CSRF token on logout
    CSRFProtection.clearToken();

    // Broadcast logout to other tabs
    authSync.broadcast({
      type: 'LOGOUT',
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Refresh auth state (re-read from localStorage)
   * Useful after external token updates
   */
  const refreshAuth = useCallback(() => {
    const accessToken = authStorage.getAccessToken();
    
    if (accessToken && !isTokenExpired(accessToken)) {
      setToken(accessToken);
    } else {
      setToken(null);
      if (accessToken) {
        authStorage.clearAuth();
      }
    }
  }, []);

  /**
   * Automatic scheduled token refresh
   * Refreshes the access token before it expires (5 minutes buffer)
   * Backend automatically rotates refresh token in HttpOnly cookie
   */
  useTokenRefresh({
    token,
    onRefresh: async (currentAccessToken) => {
      // Import authService dynamically to avoid circular dependencies
      const { authService } = await import('@/features/customer/auth/login/services/login.api');
      const response = await authService.refreshToken(currentAccessToken);
      
      // Backend rotates refresh token automatically in HttpOnly cookie
      return response.data.accessToken;
    },
    onSuccess: (newToken) => {
      console.log('[AuthProvider] Token automatically refreshed');
      updateAccessToken(newToken);
    },
    onError: (error) => {
      console.error('[AuthProvider] Automatic token refresh failed:', error);
      // Logout user if automatic refresh fails
      logout();
    },
    refreshBufferSeconds: 300, // Refresh 5 minutes before expiration
    enabled: isInitialized && !!token,
  });

  const isAuthenticated = !!token && !isTokenExpired(token);
  const userInfo = getUserInfo(token);

  const value: AuthContextType = {
    token,
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
