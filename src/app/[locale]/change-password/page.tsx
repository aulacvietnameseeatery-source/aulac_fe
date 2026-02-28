"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useChangePassword, ChangePasswordForm } from "@/features/customer/auth/change-password";
import { useEffect } from "react";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";

/**
 * Change Password Page
 * 
 * Handles two scenarios:
 * 1. First-time login password change (account locked)
 *    - User redirected here from login with tempToken in sessionStorage
 *    - No current password required
 *    - Account unlocked after successful change
 * 
 * 2. Normal password change (future feature)
 *    - User wants to change their password
 *    - Current password required
 *    - Account remains active
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    isLoading,
    isSuccess,
    error,
    submit,
    isFirstTime,
  } = useChangePassword();

  // Redirect to login after successful password change
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full relative max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 shadow-lg">
            <Image src="/images/logo.png" alt="An Lac" width={32} height={32} />
          </div>
          <Typography variant="h2" className="text-gray-900 mb-1">
            Au Lac
          </Typography>
          <Typography variant="caption" className="text-gray-500 uppercase tracking-wider">
            Restaurant Portal
          </Typography>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-6">
            {!isSuccess ? (
              <ChangePasswordForm
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                error={error}
                isLoading={isLoading}
                isFirstTime={isFirstTime}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={submit}
              />
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <Typography variant="h3" className="text-gray-900">
                    Password Changed!
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    Your password has been updated successfully.
                  </Typography>
                  <Typography variant="caption" className="text-gray-500 block pt-2">
                    Redirecting to login in 3 seconds...
                  </Typography>
                </div>
              </div>
            )}
          </CardContent>

          {!isSuccess && (
            <CardFooter className="border-t bg-gray-50/50 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </CardFooter>
          )}
        </Card>

        {/* Footer Text */}
        <Typography variant="caption" className="text-center text-gray-500 mt-6 block">
          © {new Date().getFullYear()} Au Lac Restaurant. All rights reserved.
        </Typography>
      </div>
    </div>
  );
}
