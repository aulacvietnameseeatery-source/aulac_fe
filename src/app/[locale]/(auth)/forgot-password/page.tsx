"use client";

import {
  ForgotPasswordHeader,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
  ForgotPasswordCard,
  useForgotPassword
} from "@/features/auth/forgot-password";

export default function ForgotPasswordPage() {
  const {
    email,
    setEmail,
    isLoading,
    isSuccess,
    error,
    submit,
  } = useForgotPassword();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full relative max-w-md flex flex-col items-center">
        <ForgotPasswordHeader />

        <ForgotPasswordCard>
          {!isSuccess ? (
            <ForgotPasswordForm
              email={email}
              error={error}
              isLoading={isLoading}
              onEmailChange={setEmail}
              onSubmit={submit}
            />
          ) : (
            <ForgotPasswordSuccess email={email} />
          )}
        </ForgotPasswordCard>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#9CA3AF]">
            © 2025 La Maison. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

