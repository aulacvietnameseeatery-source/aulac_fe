import { api } from "@/lib/http";
import { ForgotPasswordRequest } from "../types/forgot-password.types";
import { ApiResponse } from "@/types/api-response.types";

export const forgotPasswordApi = {
  sendResetEmail: (body: ForgotPasswordRequest) =>
    api.post<ApiResponse<void>>("/auth/forgot-password", body),
};
