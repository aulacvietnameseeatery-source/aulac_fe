import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services";
import { LoginRequest } from "../types";
import { tokenStorage } from "@/lib/auth-storage";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      // Check if login was successful
      if (response.success && response.data) {
        // Save tokens
        tokenStorage.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        
        // Save user data
        tokenStorage.setUser({
          userId: response.data.userId,
          username: response.data.username,
          roles: response.data.roles,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      // Error will be handled in the component
    },
  });
};
