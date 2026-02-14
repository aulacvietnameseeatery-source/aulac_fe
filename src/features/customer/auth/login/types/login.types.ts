import { ApiResponse } from '@/types/api-response.types';

export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response data payload
 * Note: Refresh token is stored in HttpOnly cookie by backend
 */
export interface LoginData {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  userId: number;
  username: string;
  roles: string[];
}

/**
 * Login response wrapped in standard API response
 * Use subCode === 1 and systemMessage === 'PASSWORD_CHANGE_REQUIRED' to detect password change requirement
 */
export type LoginResponse = ApiResponse<LoginData>;

export interface User {
  userId: number;
  username: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  // refreshToken removed - managed by HttpOnly cookie
}
