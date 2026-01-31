"use client";

import { LoginBackground } from "@/features/auth/login/components/login-background";
import { LoginHeader } from "@/features/auth/login/components/login-header";
import { LoginForm } from "@/features/auth/login/components/login-form";
import { LoginFooter } from "@/features/auth/login/components/login-footer";

export default function LoginUI() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-700 overflow-hidden">
      <LoginBackground />

      {/* Center container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <LoginHeader />
          <LoginForm />
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}
