import { AuthTokens, User } from "@/features/auth/login/types";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

export const tokenStorage = {
  /**
   * Save authentication tokens to localStorage
   */
  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  },

  /**
   * Get access token from localStorage
   */
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  },

  /**
   * Save user data to localStorage
   */
  setUser: (user: User): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuth: (): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};
