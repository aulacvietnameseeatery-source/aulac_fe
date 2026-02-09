import { api } from "@/lib/http";
import { ResetPasswordRequest } from "../types/reset-password.types";
import { ApiResponse } from "@/types/api-response.types";

export const resetPasswordApi = {
  reset: (body: ResetPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/auth/reset-password", body),
};
