import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { ChangePasswordRequest } from "../types/change-password.types";
import { authStorage } from "@/lib/auth-storage";

/**
 * Change password API service
 * Note: For first-time password change, temporarily stores token in authStorage
 */
export const changePasswordApi = {
  /**
   * Change user's password
   * Handles both first-time (locked account) and normal password change
   * 
   * @param body - Change password request
   * @param tempToken - Temporary token from sessionStorage (for first-time login)
   * @returns Success response
   */
  change: async (body: ChangePasswordRequest, tempToken?: string): Promise<ApiResponse<unknown>> => {
    // For first-time password change, temporarily store token for this request
    const originalToken = authStorage.getAccessToken();
    if (tempToken) {
      authStorage.setAccessToken(tempToken);
    }

    try {
      return await api.post<ApiResponse<unknown>>("/api/account/change-password", body as never);
    } finally {
      // Restore original token (or clear if there wasn't one)
      if (tempToken) {
        if (originalToken) {
          authStorage.setAccessToken(originalToken);
        } else {
          authStorage.clearAuth();
        }
      }
    }
  },
};
