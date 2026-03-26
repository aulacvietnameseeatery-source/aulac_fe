import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/routing"
import { authService } from "../services/login.api";
import { LoginRequest } from "../types/login.types";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Login mutation hook
 * Integrates with AuthProvider for centralized auth state management
 * 
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { mutate: login, isPending, isError } = useLogin();
 *   
 *   const handleSubmit = (credentials) => {
 *     login(credentials);
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useLogin = () => {
  const router = useRouter();
  const { login: setAuthTokens } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      // Check for password change requirement
      if (response.subCode === 1 && response.systemMessage === 'PASSWORD_CHANGE_REQUIRED') {
        // Store temporary token for password change
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('tempToken', response.data.accessToken);
        }
        // Redirect to password change page
        router.push('/change-password');
        return;
      }

      // Check if login was successful
      if (response.success && response.data) {
        // Save access token (refresh token in HttpOnly cookie)
        setAuthTokens(response.data.accessToken);

        // Redirect to dashboard
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      console.error("[useLogin] Login failed:", error);
      // Error will be handled in the component
    },
  });
};
