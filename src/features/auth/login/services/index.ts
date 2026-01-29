import { api } from "@/lib/http";
import { LoginRequest, LoginResponse } from "../types";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/api/auth/login", credentials as never);
  },

  logout: async (): Promise<void> => {
    // Call logout API if needed
    // await api.post<void>("/api/auth/logout", {} as never);
  },
};
