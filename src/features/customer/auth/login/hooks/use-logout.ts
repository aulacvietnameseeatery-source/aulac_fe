import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Logout mutation hook
 * Clears authentication state and redirects to login
 * 
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const { mutate: logout, isPending } = useLogout();
 *   
 *   return (
 *     <button onClick={() => logout()} disabled={isPending}>
 *       {isPending ? 'Logging out...' : 'Logout'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useLogout = () => {
  const router = useRouter();
  const { logout: clearAuth } = useAuth();

  return useMutation({
    mutationFn: async () => {
      // Optional: Call backend logout endpoint if needed
      // await authService.logout();
      
      // Clear local auth state
      clearAuth();
    },
    onSuccess: () => {
      // Redirect to login page
      router.push("/login");
    },
    onError: (error: Error) => {
      console.error("[useLogout] Logout failed:", error);
      // Still clear auth even if API call fails
      clearAuth();
      router.push("/login");
    },
  });
};
