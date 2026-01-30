"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ResetPasswordHeader,
  ResetPasswordCard,
  ResetPasswordForm,
  ResetPasswordSuccess,
  useResetPassword,
} from "@/features/auth/reset-password";

import { LoginBackground } from "@/features/auth/login/components/login-background";

function Content() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    isSuccess,
    error,
    submit,
  } = useResetPassword(token);

  if (isSuccess) {
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <ResetPasswordCard>
      {!isSuccess ? (
        <ResetPasswordForm
          password={password}
          confirmPassword={confirmPassword}
          error={error}
          isLoading={isLoading}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={submit}
        />
      ) : (
        <ResetPasswordSuccess />
      )}
    </ResetPasswordCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-700 flex items-center justify-center">
      <LoginBackground />
      <div className="w-full relative max-w-md flex flex-col items-center">
        <ResetPasswordHeader />
        <Suspense fallback={<div>Loading...</div>}>
          <Content />
        </Suspense>
      </div>
    </div>
  );
}
