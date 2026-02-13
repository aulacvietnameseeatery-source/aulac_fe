import { api } from "@/lib/http";
import { LoginRequest, LoginResponse } from "../types/login.types";

export const authService = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/api/auth/login", credentials as never);
  },

  /**
   * Refresh access token
   * Backend reads refresh token from HttpOnly cookie automatically
   * 
   * @param currentAccessToken - Current (possibly expired) access token
   * @returns New access token (refresh token rotated in HttpOnly cookie)
   */
  refreshToken: async (currentAccessToken: string): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/api/auth/refresh", { accessToken: currentAccessToken } as never);
  },

  /**
   * Logout user - clears HttpOnly refresh token cookie on backend
   */
  logout: async (): Promise<void> => {
    try {
      await api.post<void>("/api/auth/logout", {} as never);
    } catch (error) {
      console.error('[authService] Logout API failed:', error);
      // Continue with local cleanup even if backend call fails
    }
  },
};
